import Foundation
import Capacitor
import Speech
import AVFoundation

@objc(SpeechRecognition)
public class SpeechRecognition: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SpeechRecognition"
    public let jsName = "SpeechRecognition"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "available", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSupportedLanguages", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "removeAllListeners", returnType: CAPPluginReturnPromise)
    ]

    private let defaultMatches = 5
    private let messageMissingPermission = "Missing permission"
    private let messageAccessDeniedMicrophone = "User denied access to microphone"
    private let messageOngoing = "Ongoing speech recognition"
    private let messageUnknown = "Unknown error occurred"

    private var speechRecognizer: SFSpeechRecognizer?
    private var audioEngine: AVAudioEngine?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?

    @objc func available(_ call: CAPPluginCall) {
        guard let recognizer = SFSpeechRecognizer() else {
            call.resolve(["available": false])
            return
        }
        call.resolve(["available": recognizer.isAvailable])
    }

    @objc func start(_ call: CAPPluginCall) {
        if let engine = audioEngine, engine.isRunning {
            call.reject(messageOngoing)
            return
        }

        let status = SFSpeechRecognizer.authorizationStatus()
        guard status == .authorized else {
            call.reject(messageMissingPermission)
            return
        }

        AVAudioSession.sharedInstance().requestRecordPermission { granted in
            guard granted else {
                call.reject(self.messageAccessDeniedMicrophone)
                return
            }

            let language = call.getString("language") ?? "en-US"
            let maxResults = call.getInt("maxResults") ?? self.defaultMatches
            let partialResults = call.getBool("partialResults") ?? false

            self.recognitionTask?.cancel()
            self.recognitionTask = nil

            self.audioEngine = AVAudioEngine()
            self.speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: language))

            let audioSession = AVAudioSession.sharedInstance()
            do {
                try audioSession.setCategory(.playAndRecord, options: .defaultToSpeaker)
                try audioSession.setMode(.default)
                try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            } catch {
                call.reject("Microphone is already in use by another application.")
                return
            }

            self.recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            self.recognitionRequest?.shouldReportPartialResults = partialResults

            guard
                let audioEngine = self.audioEngine,
                let recognitionRequest = self.recognitionRequest
            else {
                call.reject(self.messageUnknown)
                return
            }

            let inputNode = audioEngine.inputNode
            let format = inputNode.outputFormat(forBus: 0)

            self.recognitionTask = self.speechRecognizer?.recognitionTask(with: recognitionRequest) { result, error in
                if let result {
                    var matches: [String] = []
                    for transcription in result.transcriptions.prefix(maxResults) {
                        matches.append(transcription.formattedString)
                    }

                    if partialResults {
                        self.notifyListeners("partialResults", data: ["matches": matches])
                    } else {
                        call.resolve(["matches": matches])
                    }

                    if result.isFinal {
                        audioEngine.stop()
                        inputNode.removeTap(onBus: 0)
                        self.notifyListeners("listeningState", data: ["status": "stopped"])
                        self.recognitionTask = nil
                        self.recognitionRequest = nil
                    }
                }

                if let error {
                    audioEngine.stop()
                    inputNode.removeTap(onBus: 0)
                    self.recognitionRequest = nil
                    self.recognitionTask = nil
                    self.notifyListeners("listeningState", data: ["status": "stopped"])
                    call.reject(error.localizedDescription)
                }
            }

            inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
                recognitionRequest.append(buffer)
            }

            audioEngine.prepare()
            do {
                try audioEngine.start()
                self.notifyListeners("listeningState", data: ["status": "started"])
                if partialResults {
                    call.resolve()
                }
            } catch {
                call.reject(self.messageUnknown)
            }
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        if let engine = audioEngine, engine.isRunning {
            engine.stop()
            recognitionRequest?.endAudio()
            recognitionRequest = nil
            recognitionTask = nil
            notifyListeners("listeningState", data: ["status": "stopped"])
        }
        call.resolve()
    }

    @objc func isListening(_ call: CAPPluginCall) {
        call.resolve(["listening": audioEngine?.isRunning ?? false])
    }

    @objc func getSupportedLanguages(_ call: CAPPluginCall) {
        let languages = SFSpeechRecognizer.supportedLocales().map(\.identifier)
        call.resolve(["languages": languages])
    }

    @objc override public func checkPermissions(_ call: CAPPluginCall) {
        let status = SFSpeechRecognizer.authorizationStatus()
        let permission: String
        switch status {
        case .authorized:
            permission = "granted"
        case .denied, .restricted:
            permission = "denied"
        case .notDetermined:
            permission = "prompt"
        @unknown default:
            permission = "prompt"
        }
        call.resolve(["speechRecognition": permission])
    }

    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                switch status {
                case .authorized:
                    AVAudioSession.sharedInstance().requestRecordPermission { granted in
                        call.resolve(["speechRecognition": granted ? "granted" : "denied"])
                    }
                case .denied, .restricted, .notDetermined:
                    self.checkPermissions(call)
                @unknown default:
                    self.checkPermissions(call)
                }
            }
        }
    }
}

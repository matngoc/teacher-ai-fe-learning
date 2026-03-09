/**
 * PCM Recorder AudioWorklet Processor
 * Runs on dedicated audio thread, avoiding main thread blocking
 */
class PCMRecorderProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.isRecording = false;
        this.chunkCounter = 0;
        
        // Listen for messages from main thread
        this.port.onmessage = (event) => {
            if (event.data.command === 'start') {
                this.isRecording = true;
                this.chunkCounter = 0;
            } else if (event.data.command === 'stop') {
                this.isRecording = false;
            }
        };
    }
    
    process(inputs, outputs, parameters) {
        // If not recording, just pass through
        if (!this.isRecording) {
            return true; // Keep processor alive
        }
        
        const input = inputs[0];
        
        // Check if we have input
        if (!input || !input[0]) {
            return true;
        }
        
        // Get mono channel (input[0] is first channel)
        const inputChannel = input[0];
        const bufferLength = inputChannel.length;
        
        // Convert Float32 to Int16 PCM
        const int16Array = new Int16Array(bufferLength);
        for (let i = 0; i < bufferLength; i++) {
            // Clamp to -1.0 to 1.0 range and convert to int16
            const sample = Math.max(-1, Math.min(1, inputChannel[i]));
            int16Array[i] = Math.round(sample * 32767);
        }
        
        // Send PCM data to main thread via message
        this.port.postMessage({
            type: 'audio',
            data: int16Array.buffer
        }, [int16Array.buffer]); // Transfer buffer ownership for efficiency
        
        this.chunkCounter++;
        
        // Keep processor alive
        return true;
    }
}

// Register the processor
registerProcessor('pcm-recorder-processor', PCMRecorderProcessor);

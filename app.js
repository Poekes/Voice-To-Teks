document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('recordBtn');
    const recordBtnText = recordBtn.querySelector('span');
    const copyBtn = document.getElementById('copyBtn');
    const copyText = document.getElementById('copyText');
    const clearBtn = document.getElementById('clearBtn');
    const resultText = document.getElementById('resultText');
    const statusText = document.getElementById('statusText');
    const resultContainer = document.querySelector('.result-container');

    let isRecording = false;
    let recognition = null;
    let finalTranscript = '';

    // Initialize Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onstart = () => {
            isRecording = true;
            recordBtn.classList.add('recording');
            recordBtnText.textContent = 'Berhenti';
            statusText.textContent = 'Mendengarkan... (Berbicara sekarang)';
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            resultText.textContent = finalTranscript + interimTranscript;
            
            // Auto scroll to bottom
            resultContainer.scrollTop = resultContainer.scrollHeight;

            // Show buttons if there is text
            if (finalTranscript.trim().length > 0 || interimTranscript.trim().length > 0) {
                copyBtn.style.display = 'flex';
                clearBtn.style.display = 'flex';
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                statusText.textContent = 'Tidak ada suara yang terdeteksi. Silakan coba bicara lebih keras.';
            } else if (event.error === 'audio-capture') {
                statusText.textContent = 'Mikrofon tidak ditemukan.';
            } else if (event.error === 'not-allowed') {
                statusText.textContent = 'Akses mikrofon ditolak oleh browser.';
            } else {
                statusText.textContent = `Terjadi kesalahan: ${event.error}`;
            }
            // Stop recording on error
            stopRecording();
        };

        recognition.onend = () => {
            // Continuous recording may stop automatically in some browsers after silence
            // Restart if user hasn't explicitly stopped it
            if (isRecording) {
                try {
                    recognition.start();
                } catch(e) {
                    stopRecording();
                }
            } else {
                statusText.textContent = 'Perekaman dihentikan.';
            }
        };
    } else {
        statusText.textContent = 'Browser Anda tidak mendukung Web Speech API.';
        recordBtn.disabled = true;
        recordBtn.style.opacity = '0.5';
        recordBtn.style.cursor = 'not-allowed';
    }

    function stopRecording() {
        isRecording = false;
        recognition.stop();
        recordBtn.classList.remove('recording');
        recordBtnText.textContent = 'Mulai Bicara';
    }

    recordBtn.addEventListener('click', () => {
        if (!recognition) return;

        if (isRecording) {
            stopRecording();
        } else {
            try {
                recognition.start();
            } catch (e) {
                console.error('Gagal memulai perekaman:', e);
            }
        }
    });

    copyBtn.addEventListener('click', () => {
        const textToCopy = resultText.textContent;
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyText.textContent;
            copyText.textContent = 'Tersalin!';
            copyBtn.style.backgroundColor = '#059669'; // Darker success color
            
            setTimeout(() => {
                copyText.textContent = originalText;
                copyBtn.style.backgroundColor = ''; // Revert to original
            }, 2000);
        }).catch(err => {
            console.error('Gagal menyalin teks:', err);
            statusText.textContent = 'Gagal menyalin teks ke clipboard.';
        });
    });

    clearBtn.addEventListener('click', () => {
        finalTranscript = '';
        resultText.textContent = '';
        copyBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        statusText.textContent = 'Teks berhasil dihapus.';
    });
});

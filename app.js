document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('recordBtn');
    const recordBtnText = recordBtn.querySelector('span');
    const copyBtn = document.getElementById('copyBtn');
    const copyText = document.getElementById('copyText');
    const clearBtn = document.getElementById('clearBtn');
    const undoBtn = document.getElementById('undoBtn');
    const resultText = document.getElementById('resultText');
    const statusText = document.getElementById('statusText');
    const resultContainer = document.querySelector('.result-container');

    // Modal elements
    const wordModal = document.getElementById('wordModal');
    const modalSelectedWord = document.getElementById('modalSelectedWord');
    const modalInput = document.getElementById('modalInput');
    const modalMicBtn = document.getElementById('modalMicBtn');
    const modalDeleteBtn = document.getElementById('modalDeleteBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const langSelect = document.getElementById('langSelect');

    let isRecording = false;
    let recognition = null;
    let finalTranscript = '';
    
    // Edit state
    let activeWordIndex = -1;
    let editRecognition = null;
    let isEditRecording = false;
    let isPausedForEdit = false;
    let mediaStream = null; // Menyimpan stream mic agar izin tidak terus-menerus diminta
    
    // Language state
    let currentLang = 'id-ID';
    if (langSelect) {
        currentLang = langSelect.value;
        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            if (recognition) recognition.lang = currentLang;
            if (editRecognition) editRecognition.lang = currentLang;
            
            if (isRecording) {
                stopRecording();
                statusText.textContent = 'Bahasa diubah. Silakan klik Mulai Bicara lagi.';
            }
        });
    }

    // Initialize Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLang;

        // Edit Recognition Setup
        editRecognition = new SpeechRecognition();
        editRecognition.continuous = false;
        editRecognition.interimResults = false;
        editRecognition.lang = currentLang;

        editRecognition.onstart = () => {
            isEditRecording = true;
            modalMicBtn.classList.add('recording');
            modalInput.placeholder = 'Mendengarkan...';
        };

        editRecognition.onresult = (event) => {
            const newWord = event.results[0][0].transcript;
            modalInput.value = newWord;
        };

        editRecognition.onerror = (event) => {
            console.error('Edit recognition error:', event.error);
            modalInput.placeholder = 'Gagal mendengar. Coba lagi...';
            stopEditRecording();
        };

        editRecognition.onend = () => {
            stopEditRecording();
        };

        recognition.onstart = () => {
            isRecording = true;
            recordBtn.classList.add('recording');
            recordBtnText.textContent = 'Berhenti';
            statusText.textContent = 'Mendengarkan... (Berbicara sekarang)';
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let newFinal = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    newFinal += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (newFinal) {
                finalTranscript += newFinal;
            }

            renderText(interimTranscript);
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
            // Jika dijeda untuk edit, jangan restart rekaman utama
            if (isPausedForEdit) {
                statusText.textContent = 'Perekaman dijeda untuk mengedit...';
                return;
            }

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

    function stopEditRecording() {
        isEditRecording = false;
        if (editRecognition) editRecognition.stop();
        modalMicBtn.classList.remove('recording');
        modalInput.placeholder = 'Ketik kata pengganti atau ucapkan...';
    }

    function stopRecording() {
        isRecording = false;
        recognition.stop();
        recordBtn.classList.remove('recording');
        recordBtnText.textContent = 'Mulai Bicara';

        // Hentikan stream mikrofon untuk melepaskan indikator rekaman browser
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }

    function renderText(interim = '') {
        resultText.innerHTML = '';
        
        const words = finalTranscript.trim().split(/\s+/).filter(w => w.length > 0);
        
        words.forEach((word, index) => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = word + ' ';
            span.title = 'Klik untuk edit atau hapus kata';
            span.addEventListener('click', () => {
                openModal(index, word);
            });
            resultText.appendChild(span);
        });

        if (interim) {
            const interimSpan = document.createElement('span');
            interimSpan.className = 'interim';
            interimSpan.textContent = interim;
            resultText.appendChild(interimSpan);
        }

        // Auto scroll to bottom
        resultContainer.scrollTop = resultContainer.scrollHeight;

        // Show buttons if there is text
        if (words.length > 0 || interim.trim().length > 0) {
            copyBtn.style.display = 'flex';
            clearBtn.style.display = 'flex';
            if (undoBtn) undoBtn.style.display = 'flex';
        } else {
            copyBtn.style.display = 'none';
            clearBtn.style.display = 'none';
            if (undoBtn) undoBtn.style.display = 'none';
        }
    }

    recordBtn.addEventListener('click', () => {
        if (!recognition) return;

        if (isRecording) {
            stopRecording();
        } else {
            // Trik untuk mencegah browser meminta izin terus-menerus (terutama di protokol file://)
            // Kita tahan akses mikrofonnya melalui getUserMedia
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        mediaStream = stream;
                        try {
                            recognition.start();
                        } catch (e) {
                            console.error('Gagal memulai perekaman:', e);
                        }
                    })
                    .catch(err => {
                        console.error('Akses mikrofon ditolak:', err);
                        statusText.textContent = 'Gagal mengakses mikrofon. Pastikan izin diberikan.';
                    });
            } else {
                // Fallback jika getUserMedia tidak didukung
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Gagal memulai perekaman:', e);
                }
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
        resultText.innerHTML = '';
        copyBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        if (undoBtn) undoBtn.style.display = 'none';
        statusText.textContent = 'Teks berhasil dihapus.';
    });

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            const words = finalTranscript.trim().split(/\s+/).filter(w => w.length > 0);
            if (words.length > 0) {
                words.pop(); // Remove last word
                finalTranscript = words.join(' ') + (words.length > 0 ? ' ' : '');
                renderText();
                statusText.textContent = 'Kata terakhir dihapus.';
            }
        });
    }

    // --- Modal Logic ---

    function openModal(index, word) {
        activeWordIndex = index;
        modalSelectedWord.textContent = word;
        modalInput.value = word;
        wordModal.classList.add('show');
        modalInput.focus();
        
        if (isRecording) {
            isPausedForEdit = true;
            recognition.stop();
        }
    }

    function closeModal() {
        wordModal.classList.remove('show');
        activeWordIndex = -1;
        modalInput.value = '';
        
        if (isEditRecording) {
            stopEditRecording();
        }

        if (isPausedForEdit) {
            isPausedForEdit = false;
            if (isRecording) {
                try {
                    recognition.start();
                    statusText.textContent = 'Mendengarkan... (Berbicara sekarang)';
                } catch (e) {
                    console.error('Failed to resume main recording:', e);
                }
            }
        }
    }

    function confirmEdit() {
        if (activeWordIndex > -1) {
            const newWord = modalInput.value.trim();
            const words = finalTranscript.trim().split(/\s+/).filter(w => w.length > 0);
            
            if (newWord) {
                words[activeWordIndex] = newWord;
            } else {
                words.splice(activeWordIndex, 1); // delete if empty
            }
            
            finalTranscript = words.join(' ') + (words.length > 0 ? ' ' : '');
            renderText();
        }
        closeModal();
    }

    modalMicBtn.addEventListener('click', () => {
        if (!editRecognition) return;
        
        if (isEditRecording) {
            stopEditRecording();
        } else {
            modalInput.value = '';
            try {
                editRecognition.start();
            } catch (e) {
                console.error(e);
            }
        }
    });

    modalDeleteBtn.addEventListener('click', () => {
        if (activeWordIndex > -1) {
            const words = finalTranscript.trim().split(/\s+/).filter(w => w.length > 0);
            words.splice(activeWordIndex, 1);
            finalTranscript = words.join(' ') + (words.length > 0 ? ' ' : '');
            renderText();
        }
        closeModal();
    });

    modalConfirmBtn.addEventListener('click', confirmEdit);
    
    modalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            confirmEdit();
        }
    });

    modalCancelBtn.addEventListener('click', closeModal);

    // Close modal on backdrop click
    wordModal.addEventListener('click', (e) => {
        if (e.target === wordModal) {
            closeModal();
        }
    });
});

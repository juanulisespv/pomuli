// Sidebar JavaScript - Interfaz de usuario del Pomodoro Timer
class PomodoroUI {
    constructor() {
        this.timerDisplay = document.getElementById('timer');
        this.statusDisplay = document.getElementById('status');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.projectSelect = document.getElementById('projectSelect');
        this.newProjectInput = document.getElementById('newProject');
        this.addProjectBtn = document.getElementById('addProjectBtn');
        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');
        this.autoStartCheckbox = document.getElementById('autoStartEnabled');
        this.todaySessionsSpan = document.getElementById('todaySessions');
        this.totalTimeSpan = document.getElementById('totalTime');
        this.viewHistoryBtn = document.getElementById('viewHistoryBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Modal elements
        this.historyModal = document.getElementById('historyModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.filterProject = document.getElementById('filterProject');
        this.filterPeriod = document.getElementById('filterPeriod');
        this.filterType = document.getElementById('filterType');
        this.projectStatsContainer = document.getElementById('projectStatsContainer');
        this.sessionsContainer = document.getElementById('sessionsContainer');
        this.exportJsonBtn = document.getElementById('exportJsonBtn');
        this.exportCsvBtn = document.getElementById('exportCsvBtn');
        
        // Tab elements
        this.historyTab = document.getElementById('historyTab');
        this.projectsTab = document.getElementById('projectsTab');
        this.historyContent = document.getElementById('historyContent');
        this.projectsContent = document.getElementById('projectsContent');
        this.projectManagementContainer = document.getElementById('projectManagementContainer');
        
        this.currentTimer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.currentSessionType = 'work'; // 'work' or 'break'
        this.timeRemaining = 25 * 60; // en segundos
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadProjects();
        await this.loadSettings();
        await this.loadStats();
        this.setupMessageListener();
        await this.syncWithBackground();
        this.startUIUpdateInterval();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startTimer());
        this.pauseBtn.addEventListener('click', () => {
            if (this.isPaused) {
                this.resumeTimer();
            } else {
                this.pauseTimer();
            }
        });
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.addProjectBtn.addEventListener('click', () => this.addProject());
        this.manageProjectsBtn = document.getElementById('manageProjectsBtn');
        this.manageProjectsBtn.addEventListener('click', () => this.showHistory('projects'));
        this.workTimeInput.addEventListener('change', () => this.saveSettings());
        this.breakTimeInput.addEventListener('change', () => this.saveSettings());
        this.autoStartCheckbox.addEventListener('change', () => this.saveSettings());
        this.viewHistoryBtn.addEventListener('click', () => this.showHistory());
        this.exportBtn.addEventListener('click', () => this.exportData());
        
        // Modal event listeners
        this.closeModalBtn.addEventListener('click', () => this.closeHistoryModal());
        this.filterProject.addEventListener('change', () => this.filterHistory());
        this.filterPeriod.addEventListener('change', () => this.filterHistory());
        this.filterType.addEventListener('change', () => this.filterHistory());
        this.exportJsonBtn.addEventListener('click', () => this.exportJSON());
        this.exportCsvBtn.addEventListener('click', () => this.exportCSV());
        
        // Tab event listeners
        this.historyTab.addEventListener('click', () => this.switchTab('history'));
        this.projectsTab.addEventListener('click', () => this.switchTab('projects'));
        
        // Close modal cuando se hace click fuera
        this.historyModal.addEventListener('click', (e) => {
            if (e.target === this.historyModal) {
                this.closeHistoryModal();
            }
        });
        
        // Enter key en el input de nuevo proyecto
        this.newProjectInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addProject();
            }
        });
        
        // Nuevos event listeners para alertas
        this.setupAlertEventListeners();
        
        // Event delegation para botones dinámicos
        this.setupEventDelegation();
    }
    
    setupAlertEventListeners() {
        // Elementos de la interfaz de alertas
        this.alertSettingsBtn = document.getElementById('alertSettingsBtn');
        this.alertConfiguration = document.getElementById('alertConfiguration');
        
        // Checkboxes de configuración
        this.systemNotifications = document.getElementById('systemNotifications');
        this.alertSounds = document.getElementById('alertSounds');
        this.iconFlashing = document.getElementById('iconFlashing');
        this.sidebarAutoOpen = document.getElementById('sidebarAutoOpen');
        this.browserAlert = document.getElementById('browserAlert');
        this.vibrationAlert = document.getElementById('vibrationAlert');
        this.repeatNotifications = document.getElementById('repeatNotifications');
        
        // Selectores y sliders
        this.alertIntensity = document.getElementById('alertIntensity');
        this.soundFile = document.getElementById('soundFile');
        this.flashDuration = document.getElementById('flashDuration');
        this.flashDurationValue = document.getElementById('flashDurationValue');
        this.notificationPersistence = document.getElementById('notificationPersistence');
        this.notificationPersistenceValue = document.getElementById('notificationPersistenceValue');
        
        // Botones de acción
        this.testSoundBtn = document.getElementById('testSoundBtn');
        this.testAllAlertsBtn = document.getElementById('testAllAlertsBtn');
        this.resetAlertsBtn = document.getElementById('resetAlertsBtn');
        
        // Alerta prominente
        this.prominentAlert = document.getElementById('prominentAlert');
        this.alertTitle = document.getElementById('alertTitle');
        this.alertDescription = document.getElementById('alertDescription');
        this.alertDismissBtn = document.getElementById('alertDismissBtn');
        this.alertConfigBtn = document.getElementById('alertConfigBtn');
        
        // Event listeners
        this.alertSettingsBtn.addEventListener('click', () => this.toggleAlertConfiguration());
        
        // Checkboxes
        this.systemNotifications.addEventListener('change', () => this.updateAlertSetting('systemNotifications', this.systemNotifications.checked));
        this.alertSounds.addEventListener('change', () => this.updateAlertSetting('sounds', this.alertSounds.checked));
        this.iconFlashing.addEventListener('change', () => this.updateAlertSetting('iconFlashing', this.iconFlashing.checked));
        this.sidebarAutoOpen.addEventListener('change', () => this.updateAlertSetting('sidebarAutoOpen', this.sidebarAutoOpen.checked));
        this.browserAlert.addEventListener('change', () => this.updateAlertSetting('browserAlert', this.browserAlert.checked));
        this.vibrationAlert.addEventListener('change', () => this.updateAlertSetting('vibration', this.vibrationAlert.checked));
        this.repeatNotifications.addEventListener('change', () => this.updateAlertSetting('repeatNotifications', this.repeatNotifications.checked));
        
        // Selectores
        this.alertIntensity.addEventListener('change', () => this.updateAlertSetting('alertIntensity', this.alertIntensity.value));
        this.soundFile.addEventListener('change', () => this.updateAlertSetting('soundFile', this.soundFile.value));
        
        // Sliders
        this.flashDuration.addEventListener('input', () => {
            this.flashDurationValue.textContent = `${this.flashDuration.value / 1000}s`;
            this.updateAlertSetting('flashDuration', parseInt(this.flashDuration.value));
        });
        
        this.notificationPersistence.addEventListener('input', () => {
            this.notificationPersistenceValue.textContent = `${this.notificationPersistence.value / 1000}s`;
            this.updateAlertSetting('notificationPersistence', parseInt(this.notificationPersistence.value));
        });
        
        // Botones de acción
        this.testSoundBtn.addEventListener('click', () => this.testSound());
        this.testAllAlertsBtn.addEventListener('click', () => this.testAllAlerts());
        this.resetAlertsBtn.addEventListener('click', () => this.resetAlertSettings());
        
        // Alerta prominente
        this.alertDismissBtn.addEventListener('click', () => this.dismissProminentAlert());
        this.alertConfigBtn.addEventListener('click', () => {
            this.dismissProminentAlert();
            this.toggleAlertConfiguration(true);
        });
        
        // Cargar configuración inicial
        this.loadAlertSettings();
    }
    
    async loadAlertSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getAlertSettings' });
            if (response) {
                this.applyAlertSettings(response);
            }
        } catch (error) {
            console.error('Error loading alert settings:', error);
        }
    }
    
    applyAlertSettings(settings) {
        this.systemNotifications.checked = settings.systemNotifications;
        this.alertSounds.checked = settings.sounds;
        this.iconFlashing.checked = settings.iconFlashing;
        this.sidebarAutoOpen.checked = settings.sidebarAutoOpen;
        this.browserAlert.checked = settings.browserAlert;
        this.vibrationAlert.checked = settings.vibration;
        this.repeatNotifications.checked = settings.repeatNotifications;
        
        this.alertIntensity.value = settings.alertIntensity;
        this.soundFile.value = settings.soundFile;
        this.flashDuration.value = settings.flashDuration;
        this.notificationPersistence.value = settings.notificationPersistence;
        
        this.flashDurationValue.textContent = `${settings.flashDuration / 1000}s`;
        this.notificationPersistenceValue.textContent = `${settings.notificationPersistence / 1000}s`;
    }
    
    async updateAlertSetting(setting, value) {
        try {
            await chrome.runtime.sendMessage({
                action: 'updateAlertSettings',
                setting: setting,
                value: value
            });
        } catch (error) {
            console.error('Error updating alert setting:', error);
        }
    }
    
    toggleAlertConfiguration(forceOpen = false) {
        if (forceOpen || this.alertConfiguration.classList.contains('hidden')) {
            this.alertConfiguration.classList.remove('hidden');
            this.alertSettingsBtn.textContent = '🔽 Ocultar Configuración';
        } else {
            this.alertConfiguration.classList.add('hidden');
            this.alertSettingsBtn.textContent = '⚙️ Configurar Alertas';
        }
    }
    
    async testSound() {
        this.testSoundBtn.classList.add('test-alert-active');
        
        // Simular sonido
        try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('No se pudo reproducir sonido de prueba:', error);
        }
        
        setTimeout(() => {
            this.testSoundBtn.classList.remove('test-alert-active');
        }, 500);
    }
    
    async testAllAlerts() {
        this.testAllAlertsBtn.classList.add('test-alert-active');
        
        // Mostrar alerta prominente de prueba
        this.showProminentAlert('test', {
            duration: 25,
            project: 'Proyecto de Prueba'
        });
        
        // Enviar mensaje al background para probar otras alertas
        try {
            await chrome.runtime.sendMessage({
                action: 'triggerTestAlert',
                type: 'work'
            });
        } catch (error) {
            console.error('Error testing alerts:', error);
        }
        
        setTimeout(() => {
            this.testAllAlertsBtn.classList.remove('test-alert-active');
        }, 1000);
    }
    
    async resetAlertSettings() {
        if (confirm('¿Estás seguro de que quieres restaurar la configuración de alertas a los valores predeterminados?')) {
            const defaultSettings = {
                systemNotifications: true,
                sounds: true,
                browserAlert: false,
                iconFlashing: true,
                sidebarAutoOpen: true,
                vibration: true,
                soundFile: 'default',
                alertIntensity: 'medium',
                flashDuration: 5000,
                repeatNotifications: false,
                notificationPersistence: 8000
            };
            
            for (const [setting, value] of Object.entries(defaultSettings)) {
                await this.updateAlertSetting(setting, value);
            }
            
            this.applyAlertSettings(defaultSettings);
        }
    }
    
    showProminentAlert(type, sessionData) {
        const isBreak = type === 'break';
        
        this.alertTitle.textContent = isBreak ? 
            '☕ ¡Descanso terminado!' : 
            '🎉 ¡Sesión de trabajo completada!';
            
        this.alertDescription.textContent = isBreak ?
            'Tu descanso ha terminado. ¿Listo para trabajar?' :
            `Completaste ${sessionData.duration || 25} minutos de trabajo en "${sessionData.project || 'tu proyecto'}". ¡Excelente trabajo!`;
        
        this.prominentAlert.classList.remove('hidden');
        
        // Auto-cerrar después de 10 segundos si no se interactúa
        setTimeout(() => {
            if (!this.prominentAlert.classList.contains('hidden')) {
                this.dismissProminentAlert();
            }
        }, 10000);
    }
    
    dismissProminentAlert() {
        this.prominentAlert.classList.add('hidden');
    }
    
    setupEventDelegation() {
        // Event delegation para botones dinámicos
        document.addEventListener('click', (e) => {
            // Botón editar sesión
            if (e.target.classList.contains('session-edit-btn')) {
                const sessionId = e.target.getAttribute('data-session-id');
                this.editSession(sessionId);
            }
            
            // Botón borrar sesión
            if (e.target.classList.contains('session-delete-btn')) {
                const sessionId = e.target.getAttribute('data-session-id');
                this.deleteSession(sessionId);
            }
            
            // Botón editar proyecto
            if (e.target.classList.contains('project-edit-btn')) {
                const projectName = e.target.getAttribute('data-project');
                this.editProject(projectName);
            }
            
            // Botón borrar proyecto
            if (e.target.classList.contains('project-delete-btn')) {
                const projectName = e.target.getAttribute('data-project');
                this.deleteProject(projectName);
            }
            
            // Botón fusionar proyectos
            if (e.target.id === 'mergeProjectsBtn') {
                this.mergeProjects();
            }
        });
    }
    
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'timerComplete':
                    this.handleTimerComplete(message.data);
                    break;
                case 'playSound':
                    this.playNotificationSound();
                    break;
                case 'timerTick':
                    this.updateFromBackground(message.data);
                    break;
                case 'autoStartChanged':
                    this.handleAutoStartChanged(message.data);
                    break;
                case 'openHistory':
                    this.showHistory();
                    break;
                // Nuevos casos para alertas
                case 'showProminentAlert':
                    this.showProminentAlert(message.type, message.data);
                    break;
                case 'showBrowserAlert':
                    alert(message.message);
                    break;
            }
        });
    }
    
    async syncWithBackground() {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'getTimerStatus'
            });
            
            if (response) {
                this.isRunning = response.isRunning;
                this.isPaused = response.isPaused;
                this.timeRemaining = response.timeRemaining;
                this.currentSession = response.currentSession;
                
                if (this.currentSession) {
                    this.currentSessionType = this.currentSession.type;
                    if (this.currentSession.project) {
                        this.projectSelect.value = this.currentSession.project;
                    }
                }
                
                this.updateDisplay();
                this.updateButtonStates();
                this.updateStatus();
            }
        } catch (error) {
            console.error('Error syncing with background:', error);
        }
    }
    
    updateFromBackground(data) {
        this.timeRemaining = data.timeRemaining;
        this.isRunning = data.isRunning;
        this.isPaused = data.isPaused;
        this.currentSession = data.currentSession;
        
        if (this.currentSession) {
            this.currentSessionType = this.currentSession.type;
        }
        
        this.updateDisplay();
        this.updateButtonStates();
        this.updateStatus();
    }
    
    startUIUpdateInterval() {
        // Actualizar la UI cada segundo para mantenerla sincronizada
        setInterval(async () => {
            if (this.isRunning && !this.isPaused) {
                await this.syncWithBackground();
            }
        }, 1000);
    }
    
    handleAutoStartChanged(data) {
        this.autoStartCheckbox.checked = data.enabled;
    }
    
    async startTimer() {
        if (this.isPaused) {
            // Reanudar timer pausado
            chrome.runtime.sendMessage({
                action: 'resumeTimer'
            });
        } else {
            // Iniciar nuevo timer
            const duration = this.currentSessionType === 'work' 
                ? parseInt(this.workTimeInput.value) 
                : parseInt(this.breakTimeInput.value);
            
            const selectedProject = this.projectSelect.value;
            
            if (this.currentSessionType === 'work' && !selectedProject) {
                alert('Por favor selecciona un proyecto antes de iniciar la sesión de trabajo.');
                return;
            }
            
            // Notificar al background script para que maneje todo
            chrome.runtime.sendMessage({
                action: 'startTimer',
                duration: duration,
                type: this.currentSessionType,
                project: selectedProject
            });
        }
        
        // Sincronizar estado inmediatamente
        await this.syncWithBackground();
    }
    
    async pauseTimer() {
        chrome.runtime.sendMessage({
            action: 'pauseTimer'
        });
        
        await this.syncWithBackground();
    }
    
    async resumeTimer() {
        chrome.runtime.sendMessage({
            action: 'resumeTimer'
        });
        
        await this.syncWithBackground();
    }
    
    async resetTimer() {
        chrome.runtime.sendMessage({
            action: 'resetTimer'
        });
        
        // Resetear al tiempo de trabajo
        this.currentSessionType = 'work';
        this.timeRemaining = parseInt(this.workTimeInput.value) * 60;
        
        await this.syncWithBackground();
    }
    
    handleTimerComplete(data) {
        // Reproducir sonido de notificación
        this.playNotificationSound();
        
        // Recargar datos inmediatamente para reflejar la nueva sesión
        setTimeout(async () => {
            await this.loadStats(); // Actualizar estadísticas
            await this.loadHistoryData(); // Recargar historial
        }, 2000);
        
        // Siempre sincronizar con el background para actualizar estado del timer
        setTimeout(() => {
            this.syncWithBackground();
        }, 500);
    }
    
    playNotificationSound() {
        // Crear múltiples sonidos para mayor efectividad
        try {
            // Sonido 1: Beep corto
            const audio1 = new Audio();
            audio1.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzaF1/LNeSQFJHfH8N2QQQL';
            audio1.volume = 0.8;
            audio1.play().catch(() => {});
            
            // Sonido 2: Beep más largo después de 200ms
            setTimeout(() => {
                const audio2 = new Audio();
                audio2.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzaF1/LNeSQFJHfH8N2QQQL';
                audio2.volume = 0.9;
                audio2.play().catch(() => {});
            }, 200);
            
            // Sonido 3: Confirmación después de 400ms
            setTimeout(() => {
                const audio3 = new Audio();
                audio3.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEcBzaF1/LNeSQFJHfH8N2QQQL';
                audio3.volume = 1.0;
                audio3.play().catch(() => {});
            }, 400);
            
            // Hacer vibrar la extensión visualmente (cambio de título)
            this.makeVisualAlert();
            
        } catch (error) {
            // Fallback: cambiar título de página para llamar atención
            this.makeVisualAlert();
        }
    }
    
    makeVisualAlert() {
        // Cambiar el título de la página para llamar atención
        const originalTitle = document.title;
        let blinkCount = 0;
        const maxBlinks = 6;
        
        const blinkInterval = setInterval(() => {
            document.title = blinkCount % 2 === 0 ? '🔔 ¡POMODORO COMPLETADO!' : '🍅 Pomodoro Timer';
            blinkCount++;
            
            if (blinkCount >= maxBlinks) {
                clearInterval(blinkInterval);
                document.title = originalTitle;
            }
        }, 500);
        
        // También hacer que el ícono de la extensión "parpadee" cambiando el badge
        if (chrome.action) {
            chrome.action.setBadgeText({ text: '!' });
            chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });
            
            setTimeout(() => {
                chrome.action.setBadgeText({ text: '' });
            }, 5000);
        }
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateButtonStates() {
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        this.resetBtn.disabled = false;
        
        // Cambiar el texto del botón de pausa
        if (this.isPaused) {
            this.pauseBtn.textContent = '▶️ Reanudar';
        } else {
            this.pauseBtn.textContent = '⏸️ Pausa';
        }
    }
    
    updateStatus() {
        let status = '';
        if (this.isRunning) {
            status = this.currentSessionType === 'work' ? '🔥 Trabajando...' : '☕ Descansando...';
        } else if (this.isPaused) {
            status = '⏸️ Pausado';
        } else {
            status = this.currentSessionType === 'work' ? '🍅 Listo para trabajar' : '☕ Listo para descansar';
        }
        this.statusDisplay.textContent = status;
    }
    
    async addProject() {
        const projectName = this.newProjectInput.value.trim();
        if (!projectName) return;
        
        try {
            const result = await chrome.storage.local.get(['projects']);
            const projects = result.projects || [];
            
            if (!projects.includes(projectName)) {
                projects.push(projectName);
                await chrome.storage.local.set({ projects: projects });
                
                const option = document.createElement('option');
                option.value = projectName;
                option.textContent = projectName;
                this.projectSelect.appendChild(option);
                
                this.projectSelect.value = projectName;
            }
            
            this.newProjectInput.value = '';
        } catch (error) {
            console.error('Error adding project:', error);
        }
    }
    
    async loadProjects() {
        try {
            // Limpiar opciones existentes (excepto la opción por defecto)
            this.projectSelect.innerHTML = '<option value="">Seleccionar proyecto...</option>';
            
            // Obtener SOLO proyectos de las sesiones actuales (fuente única de verdad)
            const result = await chrome.storage.local.get(['sessions']);
            const sessions = result.sessions || [];
            
            // Extraer proyectos únicos de las sesiones
            const projectsFromSessions = [...new Set(
                sessions
                    .filter(s => s.project && s.project !== 'Sin proyecto')
                    .map(s => s.project)
            )].sort();
            
            // Usar SOLO los proyectos de sesiones
            const allProjects = projectsFromSessions;
            
            // Agregar opciones al select
            allProjects.forEach(project => {
                const option = document.createElement('option');
                option.value = project;
                option.textContent = project;
                this.projectSelect.appendChild(option);
            });
            
            // Sincronizar el storage manual con las sesiones
            await chrome.storage.local.set({ projects: allProjects });
            
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }
    
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                workTime: parseInt(this.workTimeInput.value),
                breakTime: parseInt(this.breakTimeInput.value),
                autoStartEnabled: this.autoStartCheckbox.checked
            });
            
            // Notificar al background sobre el cambio de configuración
            chrome.runtime.sendMessage({
                action: 'setAutoStart',
                enabled: this.autoStartCheckbox.checked
            });
            
            // Si no hay timer corriendo, actualizar tiempo mostrado
            if (!this.isRunning && !this.isPaused) {
                this.timeRemaining = parseInt(this.workTimeInput.value) * 60;
                this.updateDisplay();
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['workTime', 'breakTime', 'autoStartEnabled']);
            
            if (result.workTime) {
                this.workTimeInput.value = result.workTime;
            } else {
                // Valor por defecto
                this.workTimeInput.value = 25;
            }
            
            if (result.breakTime) {
                this.breakTimeInput.value = result.breakTime;
            } else {
                // Valor por defecto
                this.breakTimeInput.value = 5;
            }
            
            // Inicio automático habilitado por defecto
            if (result.autoStartEnabled !== undefined) {
                this.autoStartCheckbox.checked = result.autoStartEnabled;
            } else {
                this.autoStartCheckbox.checked = true; // Por defecto habilitado
                // Guardar esta configuración por defecto
                await chrome.storage.local.set({ autoStartEnabled: true });
                // Notificar al background
                chrome.runtime.sendMessage({
                    action: 'setAutoStart',
                    enabled: true
                });
            }
            
            // Actualizar tiempo mostrado
            this.timeRemaining = parseInt(this.workTimeInput.value) * 60;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    async loadStats() {
        try {
            const result = await chrome.storage.local.get(['sessions', 'projectStats']);
            const sessions = result.sessions || [];
            
            // Calcular sesiones de hoy
            const today = new Date().toDateString();
            const todaySessions = sessions.filter(s => s.date === today && s.type === 'work').length;
            this.todaySessionsSpan.textContent = todaySessions;
            
            // Calcular tiempo total
            const totalMinutes = sessions
                .filter(s => s.type === 'work')
                .reduce((total, session) => total + session.duration, 0);
            
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            this.totalTimeSpan.textContent = `${hours}h ${minutes}m`;
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    async showHistory(activeTab = 'history') {
        await this.loadHistoryData();
        this.historyModal.classList.remove('hidden');
        
        // Si queremos mostrar la pestaña de proyectos, cargar los datos
        if (activeTab === 'projects') {
            this.switchTab('projects');
            await this.loadProjectManagementData();
        } else {
            this.switchTab('history');
        }
    }
    
    closeHistoryModal() {
        this.historyModal.classList.add('hidden');
    }
    
    switchTab(tabName) {
        // Actualizar las pestañas activas
        this.historyTab.classList.toggle('active', tabName === 'history');
        this.projectsTab.classList.toggle('active', tabName === 'projects');
        
        // Mostrar/ocultar contenido
        this.historyContent.classList.toggle('active', tabName === 'history');
        this.projectsContent.classList.toggle('active', tabName === 'projects');
        
        // Si se cambia a la pestaña de proyectos, cargar los datos
        if (tabName === 'projects') {
            this.loadProjectManagementData();
        }
    }
    
    async loadHistoryData() {
        try {
            const result = await chrome.storage.local.get(['sessions', 'projectStats', 'dailyStats']);
            this.allSessions = result.sessions || [];
            this.projectStats = result.projectStats || {};
            this.dailyStats = result.dailyStats || {};
            
            // Migrar/reparar sesiones antiguas que podrían tener datos incompletos
            const migratedSessions = this.migrateLegacySessions(this.allSessions);
            
            // Si hubo cambios, guardar las sesiones migradas
            if (JSON.stringify(migratedSessions) !== JSON.stringify(this.allSessions)) {
                this.allSessions = migratedSessions;
                await chrome.storage.local.set({ sessions: this.allSessions });
            }
            
            // Cargar proyectos en el filtro
            this.loadProjectFilter();
            
            // Mostrar datos iniciales
            this.filterHistory();
            
        } catch (error) {
            console.error('❌ Error loading history data:', error);
        }
    }
    
    migrateLegacySessions(sessions) {
        return sessions.map(session => {
            // Asegurar que todas las sesiones tengan un ID único
            if (!session.id) {
                session.id = Date.now() + Math.random(); // ID único para sesiones sin ID
            }
            
            // Si la sesión ya tiene todos los campos necesarios, devolverla tal como está
            if (session.isoDate && session.dayOfWeek && session.month) {
                return session;
            }
            
            // Migrar sesión antigua
            let sessionDate;
            if (session.completedAt) {
                sessionDate = new Date(session.completedAt);
            } else if (session.date) {
                sessionDate = new Date(session.date);
            } else {
                // Fallback para sesiones muy antiguas
                sessionDate = new Date();
            }
            
            // Verificar si la fecha es válida
            if (isNaN(sessionDate.getTime())) {
                sessionDate = new Date();
            }
            
            return {
                ...session,
                id: session.id, // Mantener ID existente o usar el nuevo
                isoDate: sessionDate.toISOString().split('T')[0],
                dayOfWeek: sessionDate.toLocaleDateString('es-ES', { weekday: 'long' }),
                month: sessionDate.toLocaleDateString('es-ES', { month: 'long' }),
                year: sessionDate.getFullYear(),
                project: session.project || 'Sin proyecto',
                duration: session.duration || 25, // Duración por defecto si no existe
                durationSeconds: (session.duration || 25) * 60
            };
        });
    }
    
    loadProjectFilter() {
        // Limpiar opciones existentes (excepto "Todos los proyectos")
        this.filterProject.innerHTML = '<option value="">Todos los proyectos</option>';
        
        // Agregar proyectos únicos
        const projects = [...new Set(this.allSessions.map(s => s.project).filter(p => p))];
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            this.filterProject.appendChild(option);
        });
    }
    
    filterHistory() {
        const projectFilter = this.filterProject.value;
        const periodFilter = this.filterPeriod.value;
        const typeFilter = this.filterType.value;
        
        let filteredSessions = this.allSessions;
        
        // Filtrar por proyecto
        if (projectFilter) {
            filteredSessions = filteredSessions.filter(s => s.project === projectFilter);
        }
        
        // Filtrar por período
        if (periodFilter !== 'all') {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            switch (periodFilter) {
                case 'today':
                    filteredSessions = filteredSessions.filter(s => s.isoDate === today);
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    filteredSessions = filteredSessions.filter(s => s.isoDate >= weekAgo);
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    filteredSessions = filteredSessions.filter(s => s.isoDate >= monthAgo);
                    break;
            }
        }
        
        // Filtrar por tipo
        if (typeFilter !== 'all') {
            filteredSessions = filteredSessions.filter(s => s.type === typeFilter);
        }
        
        this.displayProjectStats(filteredSessions);
        this.displaySessionsList(filteredSessions);
    }
    
    displayProjectStats(sessions) {
        const projectStatsData = {};
        
        // Agrupar sesiones por proyecto
        sessions.filter(s => s.type === 'work' && s.project).forEach(session => {
            if (!projectStatsData[session.project]) {
                projectStatsData[session.project] = {
                    name: session.project,
                    sessions: 0,
                    totalTime: 0,
                    avgSession: 0
                };
            }
            
            projectStatsData[session.project].sessions++;
            projectStatsData[session.project].totalTime += session.duration;
        });
        
        // Calcular promedios
        Object.values(projectStatsData).forEach(stats => {
            stats.avgSession = Math.round(stats.totalTime / stats.sessions);
        });
        
        // Generar HTML
        const html = Object.values(projectStatsData)
            .sort((a, b) => b.totalTime - a.totalTime)
            .map(stats => `
                <div class="project-stat-card">
                    <div class="project-stat-header">
                        <h5>${stats.name}</h5>
                        <span class="project-total-time">${this.formatDuration(stats.totalTime)}</span>
                    </div>
                    <div class="project-stat-details">
                        <span>📊 ${stats.sessions} sesiones</span>
                        <span>⏱️ ${stats.avgSession} min promedio</span>
                    </div>
                </div>
            `).join('');
        
        this.projectStatsContainer.innerHTML = html || '<p class="no-data">No hay datos para mostrar</p>';
    }
    
    displaySessionsList(sessions) {
        // Ordenar sesiones por fecha (más recientes primero)
        const sortedSessions = sessions.sort((a, b) => b.completedAt - a.completedAt);
        
        // Agrupar por día
        const sessionsByDay = {};
        sortedSessions.forEach(session => {
            // Manejar sesiones antiguas que podrían no tener isoDate
            let day;
            if (session.isoDate) {
                day = session.isoDate;
            } else if (session.completedAt) {
                // Convertir timestamp a fecha ISO
                day = new Date(session.completedAt).toISOString().split('T')[0];
            } else if (session.date) {
                // Convertir date string a fecha ISO
                day = new Date(session.date).toISOString().split('T')[0];
            } else {
                // Fallback para sesiones muy antiguas
                day = new Date().toISOString().split('T')[0];
            }
            
            if (!sessionsByDay[day]) {
                sessionsByDay[day] = [];
            }
            sessionsByDay[day].push(session);
        });
        
        // Generar HTML
        const html = Object.entries(sessionsByDay)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 10) // Mostrar solo los últimos 10 días
            .map(([day, daySessions]) => `
                <div class="session-day-group">
                    <h5 class="session-day-header">
                        ${this.formatDate(day)}
                        <span class="day-summary">(${daySessions.length} sesiones)</span>
                    </h5>
                    <div class="session-day-content">
                        ${daySessions.map(session => {
                            // Manejar tiempo de sesión con validaciones
                            let sessionTime = '??:??';
                            if (session.completedAt) {
                                const date = new Date(session.completedAt);
                                if (!isNaN(date.getTime())) {
                                    sessionTime = date.toLocaleTimeString('es-ES', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    });
                                }
                            }
                            
                            // Manejar duración con validación
                            const duration = session.duration || 25;
                            
                            // Manejar proyecto con validación
                            const project = session.project && session.project !== 'Sin proyecto' 
                                ? session.project 
                                : null;
                            
                            return `
                            <div class="session-item ${session.type || 'work'}" data-session-id="${session.id}">
                                <div class="session-time">
                                    ${sessionTime}
                                </div>
                                <div class="session-details">
                                  
                                    ${project ? `<h4>${project}</h4>` : ''}
                                      <span class="session-type">
                                        ${session.type === 'work' ? '🔥' : '☕'} 
                                        ${session.type === 'work' ? 'Trabajo' : 'Descanso'}: ${duration} min
                                    </span> 
                                </div>
                                <div class="session-actions">
                                    <button class="session-edit-btn" data-session-id="${session.id}" title="Editar sesión">
                                        ✏️
                                    </button>
                                    <button class="session-delete-btn" data-session-id="${session.id}" title="Borrar sesión">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('');
        
        this.sessionsContainer.innerHTML = html || '<p class="no-data">No hay sesiones para mostrar</p>';
    }
    
    formatDate(isoDate) {
        // Validar que isoDate sea válido
        if (!isoDate || isoDate === 'undefined' || isoDate === 'null') {
            return 'Fecha desconocida';
        }
        
        const date = new Date(isoDate);
        
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (isoDate === today) return 'Hoy';
        if (isoDate === yesterday) return 'Ayer';
        
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    }
    
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    }
    
    async exportJSON() {
        try {
            const result = await chrome.storage.local.get(['sessions', 'projectStats', 'dailyStats']);
            const data = {
                sessions: result.sessions || [],
                projectStats: result.projectStats || {},
                dailyStats: result.dailyStats || {},
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });
            
            this.downloadFile(blob, `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`);
        } catch (error) {
            console.error('Error exporting JSON:', error);
            alert('Error al exportar datos en JSON');
        }
    }
    
    async exportCSV() {
        try {
            const result = await chrome.storage.local.get(['sessions']);
            const sessions = result.sessions || [];
            
            // Crear headers CSV
            const headers = [
                'Fecha',
                'Hora',
                'Tipo',
                'Proyecto',
                'Duración (min)',
                'Día de la semana',
                'Mes',
                'Año'
            ];
            
            // Convertir sesiones a CSV
            const csvData = sessions.map(session => [
                session.isoDate,
                new Date(session.completedAt).toLocaleTimeString('es-ES'),
                session.type === 'work' ? 'Trabajo' : 'Descanso',
                session.project || 'Sin proyecto',
                session.duration,
                session.dayOfWeek,
                session.month,
                session.year
            ]);
            
            // Combinar headers y datos
            const csvContent = [headers, ...csvData]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            this.downloadFile(blob, `pomodoro-sessions-${new Date().toISOString().split('T')[0]}.csv`);
            
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Error al exportar datos en CSV');
        }
    }
    
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    async exportData() {
        // Función simplificada que usa el exportJSON
        await this.exportJSON();
    }
    
    // Funciones para editar y borrar sesiones
    async editSession(sessionId) {
        try {
            // Obtener la sesión actual
            const result = await chrome.storage.local.get(['sessions']);
            const sessions = result.sessions || [];
            
            // Buscar sesión (compatible con string e int)
            const session = sessions.find(s => s.id == sessionId || s.id === parseInt(sessionId));
            
            if (!session) {
                console.error('❌ Sesión no encontrada. ID buscado:', sessionId, 'IDs disponibles:', sessions.map(s => s.id));
                alert('Sesión no encontrada');
                return;
            }
            
            // Crear un formulario de edición
            const newProject = prompt('Editar proyecto:', session.project || '');
            if (newProject === null) return; // Usuario canceló
            
            const newDuration = prompt('Editar duración (minutos):', session.duration || 25);
            if (newDuration === null) return; // Usuario canceló
            
            const duration = parseInt(newDuration);
            if (isNaN(duration) || duration <= 0) {
                alert('Duración inválida');
                return;
            }
            
            // Actualizar la sesión
            session.project = newProject.trim() || 'Sin proyecto';
            session.duration = duration;
            session.durationSeconds = duration * 60;
            
            // Guardar cambios
            await chrome.storage.local.set({ sessions });
            
            // Actualizar los datos locales primero
            this.allSessions = sessions;
            
            // Actualizar filtros de proyectos en caso de que haya cambiado
            this.loadProjectFilter();
            
            // Actualizar la UI
            await this.filterHistory();
            await this.loadStats();
            
            console.log('✅ Sesión editada:', session);
            
        } catch (error) {
            console.error('❌ Error editando sesión:', error);
            alert('Error al editar la sesión');
        }
    }
    
    async deleteSession(sessionId) {
        if (!confirm('¿Estás seguro de que quieres borrar esta sesión?')) {
            return;
        }
        
        try {
            // Obtener sesiones actuales
            const result = await chrome.storage.local.get(['sessions']);
            const sessions = result.sessions || [];
            
            // Filtrar la sesión a borrar (compatible con string e int)
            const updatedSessions = sessions.filter(s => s.id != sessionId && s.id !== parseInt(sessionId));
            
            if (sessions.length === updatedSessions.length) {
                console.error('❌ Sesión no encontrada para borrar. ID buscado:', sessionId, 'IDs disponibles:', sessions.map(s => s.id));
                alert('Sesión no encontrada');
                return;
            }
            
            // Guardar las sesiones actualizadas
            await chrome.storage.local.set({ sessions: updatedSessions });
            
            // Actualizar los datos locales primero
            this.allSessions = updatedSessions;
            
            // Actualizar filtros de proyectos en caso de que se haya eliminado el último proyecto
            this.loadProjectFilter();
            
            // Actualizar la UI
            await this.filterHistory();
            await this.loadStats();
            
            console.log('✅ Sesión borrada, total restante:', updatedSessions.length);
            
        } catch (error) {
            console.error('❌ Error borrando sesión:', error);
            alert('Error al borrar la sesión');
        }
    }
    
    // Funciones para gestionar proyectos
    async loadProjectManagementData() {
        try {
            const result = await chrome.storage.local.get(['projectStats', 'sessions']);
            const projectStats = result.projectStats || {};
            const sessions = result.sessions || [];
            
            // Obtener lista de todos los proyectos únicos (de stats y sesiones)
            const allProjects = new Set();
            
            // Agregar proyectos de estadísticas
            Object.keys(projectStats).forEach(project => {
                if (project && project !== 'Sin proyecto') {
                    allProjects.add(project);
                }
            });
            
            // Agregar proyectos de sesiones
            sessions.forEach(session => {
                if (session.project && session.project !== 'Sin proyecto') {
                    allProjects.add(session.project);
                }
            });
            
            const projectList = Array.from(allProjects).sort();
            
            if (projectList.length === 0) {
                this.projectManagementContainer.innerHTML = '<p class="no-data">No hay proyectos para gestionar</p>';
            } else {
                this.displayProjectList(projectList, projectStats);
            }
        } catch (error) {
            console.error('❌ Error cargando gestión de proyectos:', error);
        }
    }
    
    displayProjectList(projects, projectStats) {
        const html = `
            <div class="project-management-list">
                ${projects.map(project => {
                    const stats = projectStats[project] || { totalTime: 0, sessions: 0 };
                    return `
                        <div class="project-management-item" data-project="${project}">
                            <div class="project-info">
                                <div class="project-name">${project}</div>
                                <div class="project-stats">
                                    ${stats.sessions} sesiones · ${Math.round(stats.totalTime)} min
                                </div>
                            </div>
                            <div class="project-actions">
                                <button class="project-edit-btn" data-project="${project}" title="Editar proyecto">
                                    ✏️
                                </button>
                                <button class="project-delete-btn" data-project="${project}" title="Borrar proyecto">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="project-merge-section">
                <h4>Fusionar Proyectos</h4>
                <p class="merge-description">Selecciona proyectos similares para fusionarlos:</p>
                <div class="merge-controls">
                    <select id="mergeFromSelect">
                        <option value="">Proyecto origen...</option>
                        ${projects.map(project => `<option value="${project}">${project}</option>`).join('')}
                    </select>
                    <span>→</span>
                    <select id="mergeToSelect">
                        <option value="">Proyecto destino...</option>
                        ${projects.map(project => `<option value="${project}">${project}</option>`).join('')}
                    </select>
                    <button id="mergeProjectsBtn" class="btn btn-small">Fusionar</button>
                </div>
            </div>
        `;
        
        this.projectManagementContainer.innerHTML = html;
    }
    
    async editProject(oldProjectName) {
        const newProjectName = prompt('Editar nombre del proyecto:', oldProjectName);
        if (!newProjectName || newProjectName === oldProjectName) return;
        
        if (newProjectName.trim() === '') {
            alert('El nombre del proyecto no puede estar vacío');
            return;
        }
        
        try {
            const result = await chrome.storage.local.get(['projectStats', 'sessions', 'projects']);
            const projectStats = result.projectStats || {};
            const sessions = result.sessions || [];
            const projects = result.projects || [];
            
            // Actualizar estadísticas de proyectos
            if (projectStats[oldProjectName]) {
                projectStats[newProjectName.trim()] = projectStats[oldProjectName];
                delete projectStats[oldProjectName];
            }
            
            // Actualizar sesiones
            sessions.forEach(session => {
                if (session.project === oldProjectName) {
                    session.project = newProjectName.trim();
                }
            });
            
            // Actualizar lista manual de proyectos
            const projectIndex = projects.indexOf(oldProjectName);
            if (projectIndex !== -1) {
                projects[projectIndex] = newProjectName.trim();
            }
            
            // Guardar cambios
            await chrome.storage.local.set({ projectStats, sessions, projects });
            
            // Actualizar datos locales
            this.allSessions = sessions;
            
            // Actualizar UI
            this.loadProjects();
            this.loadProjectManagementData();
            
            console.log('✅ Proyecto renombrado:', oldProjectName, '→', newProjectName);
            
        } catch (error) {
            console.error('❌ Error editando proyecto:', error);
            alert('Error al editar el proyecto');
        }
    }
    
    async deleteProject(projectName) {
        const sessionsCount = await this.getProjectSessionsCount(projectName);
        
        if (!confirm(`¿Estás seguro de que quieres borrar el proyecto "${projectName}"?\n\nEsto eliminará:\n- ${sessionsCount} sesiones\n- Todas las estadísticas del proyecto\n\nEsta acción no se puede deshacer.`)) {
            return;
        }
        
        try {
            const result = await chrome.storage.local.get(['projectStats', 'sessions', 'projects']);
            const projectStats = result.projectStats || {};
            const sessions = result.sessions || [];
            const projects = result.projects || [];
            
            // Eliminar estadísticas del proyecto
            delete projectStats[projectName];
            
            // Eliminar sesiones del proyecto
            const updatedSessions = sessions.filter(session => session.project !== projectName);
            
            // Eliminar proyecto de la lista manual de proyectos
            const updatedProjects = projects.filter(project => project !== projectName);
            
            // Guardar cambios
            await chrome.storage.local.set({ 
                projectStats, 
                sessions: updatedSessions,
                projects: updatedProjects
            });
            
            // Actualizar datos locales
            this.allSessions = updatedSessions;
            
            // Actualizar UI
            await this.loadProjects();
            await this.filterHistory();
            await this.loadStats();
            await this.loadProjectManagementData();
            
            console.log('✅ Proyecto borrado:', projectName);
            
        } catch (error) {
            console.error('❌ Error borrando proyecto:', error);
            alert('Error al borrar el proyecto');
        }
    }
    
    async getProjectSessionsCount(projectName) {
        try {
            const result = await chrome.storage.local.get(['sessions']);
            const sessions = result.sessions || [];
            return sessions.filter(session => session.project === projectName).length;
        } catch (error) {
            return 0;
        }
    }
    
    async mergeProjects() {
        const fromProject = document.getElementById('mergeFromSelect').value;
        const toProject = document.getElementById('mergeToSelect').value;
        
        if (!fromProject || !toProject) {
            alert('Selecciona ambos proyectos para fusionar');
            return;
        }
        
        if (fromProject === toProject) {
            alert('No puedes fusionar un proyecto consigo mismo');
            return;
        }
        
        if (!confirm(`¿Fusionar "${fromProject}" con "${toProject}"?\n\nTodas las sesiones y estadísticas de "${fromProject}" se moverán a "${toProject}".`)) {
            return;
        }
        
        try {
            const result = await chrome.storage.local.get(['projectStats', 'sessions', 'projects']);
            const projectStats = result.projectStats || {};
            const sessions = result.sessions || [];
            const projects = result.projects || [];
            
            // Fusionar estadísticas
            if (projectStats[fromProject]) {
                if (!projectStats[toProject]) {
                    projectStats[toProject] = {
                        name: toProject,
                        totalTime: 0,
                        sessions: 0,
                        lastUsed: Date.now()
                    };
                }
                
                projectStats[toProject].totalTime += projectStats[fromProject].totalTime;
                projectStats[toProject].sessions += projectStats[fromProject].sessions;
                projectStats[toProject].lastUsed = Math.max(
                    projectStats[toProject].lastUsed || 0,
                    projectStats[fromProject].lastUsed || 0
                );
                
                delete projectStats[fromProject];
            }
            
            // Fusionar sesiones
            sessions.forEach(session => {
                if (session.project === fromProject) {
                    session.project = toProject;
                }
            });
            
            // Actualizar lista manual de proyectos
            const fromIndex = projects.indexOf(fromProject);
            if (fromIndex !== -1) {
                projects.splice(fromIndex, 1); // Eliminar proyecto origen
            }
            if (!projects.includes(toProject)) {
                projects.push(toProject); // Asegurar que el proyecto destino existe
            }
            
            // Guardar cambios
            await chrome.storage.local.set({ projectStats, sessions, projects });
            
            // Actualizar datos locales
            this.allSessions = sessions;
            
            // Actualizar UI
            await this.loadProjects();
            await this.filterHistory();
            await this.loadStats();
            await this.loadProjectManagementData();
            
            console.log('✅ Proyectos fusionados:', fromProject, '→', toProject);
            
        } catch (error) {
            console.error('❌ Error fusionando proyectos:', error);
            alert('Error al fusionar proyectos');
        }
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

// Inicializar la UI cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const pomodoroUI = new PomodoroUI();
    window.pomodoroUI = pomodoroUI;
});

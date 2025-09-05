// Background script para manejar el temporizador y notificaciones
// Gestor de alertas y notificaciones mejorado
class EnhancedAlertManager {
    constructor() {
        this.lastNotificationId = null;
        this.alertSettings = {
            systemNotifications: true,
            sounds: true,
            browserAlert: false,
            iconFlashing: true,
            sidebarAutoOpen: true,
            vibration: true, // Para dispositivos compatibles
            soundFile: 'default', // default, bell, chime, custom
            alertIntensity: 'medium', // low, medium, high
            flashDuration: 5000,
            repeatNotifications: false,
            notificationPersistence: 8000
        };
        this.flashInterval = null;
        this.originalIcon = 'icons/icon48.png';
        this.alertIcon = 'icons/icon48-alert.png'; // Necesitaremos crear este
        this.audioContext = null;
        this.initializeAudio();
    }

    async initializeAudio() {
        try {
            this.audioContext = new AudioContext();
        } catch (error) {
            console.warn('AudioContext no disponible:', error);
        }
    }

    // Cargar configuraciones de alertas desde storage
    async loadAlertSettings() {
        try {
            const result = await chrome.storage.local.get('alertSettings');
            if (result.alertSettings) {
                this.alertSettings = { ...this.alertSettings, ...result.alertSettings };
            }
        } catch (error) {
            console.error('Error loading alert settings:', error);
        }
    }

    // Guardar configuraciones de alertas
    async saveAlertSettings() {
        try {
            await chrome.storage.local.set({ alertSettings: this.alertSettings });
        } catch (error) {
            console.error('Error saving alert settings:', error);
        }
    }

    // Sistema principal de alertas múltiples
    async triggerSessionAlert(type, sessionData = {}) {
        const { duration = 0, project = '', nextType = '' } = sessionData;
        
        // 1. Notificación del sistema (existente mejorada)
        if (this.alertSettings.systemNotifications) {
            this.showEnhancedSystemNotification(type, sessionData);
        }

        // 2. Sonido personalizable
        if (this.alertSettings.sounds) {
            this.playNotificationSound(type);
        }

        // 3. Flash del icono en la toolbar
        if (this.alertSettings.iconFlashing) {
            this.startIconFlashing();
        }

        // 4. Auto-abrir sidebar con mensaje prominente
        if (this.alertSettings.sidebarAutoOpen) {
            this.openSidebarWithAlert(type, sessionData);
        }

        // 5. Alert nativo del navegador (opcional)
        if (this.alertSettings.browserAlert) {
            this.showBrowserAlert(type, sessionData);
        }

        // 6. Vibración (dispositivos compatibles)
        if (this.alertSettings.vibration && navigator.vibrate) {
            this.triggerVibration(type);
        }

        // 7. Repetir notificaciones si está habilitado
        if (this.alertSettings.repeatNotifications) {
            this.scheduleRepeatNotifications(type, sessionData);
        }
    }

    showEnhancedSystemNotification(type, sessionData) {
        // Prevenir notificaciones duplicadas
        const currentTime = Date.now();
        const notificationKey = `${type}-${Math.floor(currentTime / 5000)}`;
        
        if (this.lastNotificationId === notificationKey) {
            return;
        }
        
        this.lastNotificationId = notificationKey;
        
        let title, message, nextAction;
        let iconUrl = type === 'work' ? 'icons/icon48.png' : 'icons/icon48.png';
        
        if (type === 'work') {
            title = '🎉 ¡Sesión de trabajo completada!';
            message = `Completaste ${sessionData.duration || 25} minutos de trabajo en "${sessionData.project || 'Proyecto'}". ¡Excelente!`;
            nextAction = 'Pausa iniciando automáticamente...';
        } else {
            title = '☕ ¡Descanso terminado!';
            message = `Tu descanso de ${sessionData.duration || 5} minutos ha terminado.`;
            nextAction = sessionData.autoStart ? 'Trabajo iniciando automáticamente...' : 'Presiona "Iniciar" cuando estés listo';
        }
        
        const notificationId = `pomodoro-enhanced-${type}-${Date.now()}`;
        
        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: iconUrl,
            title: title,
            message: message,
            requireInteraction: true,
            priority: 2,
            buttons: [
                { title: '🍅 Abrir Pomodoro' },
                { title: '⚙️ Configurar Alertas' },
                { title: '📊 Ver Estadísticas' }
            ]
        });

        // Auto-cerrar según configuración
        setTimeout(() => {
            chrome.notifications.clear(notificationId);
        }, this.alertSettings.notificationPersistence);
    }

    // Reproducir sonidos personalizables
    playNotificationSound(type) {
        const soundMap = {
            work: this.getWorkCompletionSound(),
            break: this.getBreakCompletionSound()
        };

        if (this.alertSettings.soundFile === 'default') {
            // Usar sonidos del sistema
            this.playSystemSound(type);
        } else {
            // Reproducir sonido personalizado
            this.playCustomSound(soundMap[type]);
        }
    }

    playSystemSound(type) {
        // Crear un tono usando Web Audio API
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Frecuencias diferentes para work vs break
        oscillator.frequency.setValueAtTime(
            type === 'work' ? 800 : 600, 
            this.audioContext.currentTime
        );
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        // Patrón de sonido diferente según el tipo
        if (type === 'work') {
            // Tres tonos para trabajo completado
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
            
            setTimeout(() => this.playSystemSound('work-repeat'), 300);
        } else {
            // Dos tonos para descanso
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
            setTimeout(() => this.playSystemSound('break-repeat'), 400);
        }
    }

    // Flash del icono de la extensión
    startIconFlashing() {
        if (this.flashInterval) {
            clearInterval(this.flashInterval);
        }

        let isAlert = false;
        this.flashInterval = setInterval(() => {
            // Alternar entre icono normal y versión más oscura/clara
            const iconPath = isAlert ? 
                { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png' } :
                { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png' };
            
            // Usar el badge para crear efecto de flash
            if (isAlert) {
                chrome.action.setBadgeText({ text: '!' });
                chrome.action.setBadgeBackgroundColor({ color: '#ff0000' });
            } else {
                chrome.action.setBadgeText({ text: '' });
            }
            
            chrome.action.setIcon({ path: iconPath });
            isAlert = !isAlert;
        }, 500);

        // Detener después del tiempo configurado
        setTimeout(() => {
            clearInterval(this.flashInterval);
            this.flashInterval = null;
            // Restaurar icono y badge original
            chrome.action.setIcon({
                path: { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png' }
            });
            chrome.action.setBadgeText({ text: '' });
        }, this.alertSettings.flashDuration);
    }

    // Abrir sidebar con alerta prominente
    async openSidebarWithAlert(type, sessionData) {
        try {
            // Enviar mensaje al sidebar para mostrar alerta prominente
            await chrome.runtime.sendMessage({
                action: 'showProminentAlert',
                type: type,
                data: sessionData
            });

            // Intentar abrir el sidebar
            await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
        } catch (error) {
            console.warn('No se pudo abrir sidebar automáticamente:', error);
        }
    }

    // Alert nativo del navegador
    showBrowserAlert(type, sessionData) {
        const message = type === 'work' ? 
            `¡Sesión de trabajo completada! (${sessionData.duration || 25} min)` :
            `¡Descanso terminado! Tiempo de trabajar.`;
        
        // Enviar mensaje al sidebar para mostrar alert()
        chrome.runtime.sendMessage({
            action: 'showBrowserAlert',
            message: message
        });
    }

    // Vibración para dispositivos compatibles
    triggerVibration(type) {
        if (!navigator.vibrate) return;

        const pattern = type === 'work' ? 
            [200, 100, 200, 100, 200] : // Trabajo: 3 pulsos
            [300, 200, 300]; // Descanso: 2 pulsos

        navigator.vibrate(pattern);
    }

    // Repetir notificaciones
    scheduleRepeatNotifications(type, sessionData) {
        // Repetir cada 30 segundos, máximo 3 veces
        let repeatCount = 0;
        const maxRepeats = 3;
        
        const repeatInterval = setInterval(() => {
            repeatCount++;
            if (repeatCount >= maxRepeats) {
                clearInterval(repeatInterval);
                return;
            }
            
            // Notificación de recordatorio
            chrome.notifications.create(`pomodoro-reminder-${Date.now()}`, {
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: '🔔 Recordatorio Pomodoro',
                message: `No olvides ${type === 'work' ? 'tomar tu descanso' : 'continuar trabajando'}`,
                requireInteraction: false,
                priority: 1
            });
        }, 30000);
    }

    getWorkCompletionSound() {
        return 'sounds/work-complete.mp3'; // Archivo que necesitaremos crear
    }

    getBreakCompletionSound() {
        return 'sounds/break-complete.mp3'; // Archivo que necesitaremos crear
    }

    // Métodos para configuración de usuario
    updateAlertSetting(setting, value) {
        this.alertSettings[setting] = value;
        this.saveAlertSettings();
    }

    getAlertSettings() {
        return { ...this.alertSettings };
    }
}

// Gestor de timer mejorado
class TimerManager {
    constructor(alertManager) {
        this.alertManager = alertManager;
        this.isRunning = false;
        this.isPaused = false;
        this.timeRemaining = 25 * 60; // en segundos
        this.startTime = null;
        this.originalDuration = 0;
        this.currentSession = null;
        this.isCompletingTimer = false;
        
        this.setupAlarmListener();
    }
    
    setupAlarmListener() {
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'pomodoroTimer') {
                this.handleTimerComplete();
            }
        });
    }
    
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'startTimer':
                    this.startTimer(message.duration, message.type, message.project);
                    sendResponse({ success: true });
                    break;
                    
                case 'pauseTimer':
                    this.pauseTimer();
                    sendResponse({ success: true });
                    break;
                    
                case 'resetTimer':
                    this.resetTimer();
                    sendResponse({ success: true });
                    break;
                    
                case 'getTimerStatus':
                    sendResponse({
                        isRunning: this.isRunning,
                        isPaused: this.isPaused,
                        timeRemaining: this.getActualTimeRemaining(),
                        currentSession: this.currentSession,
                        autoStartEnabled: this.autoStartEnabled,
                        lastProject: this.lastProject
                    });
                    break;
                    
                case 'resumeTimer':
                    this.resumeTimer();
                    sendResponse({ success: true });
                    break;
                    
                case 'setAutoStart':
                    this.setAutoStart(message.enabled);
                    sendResponse({ success: true });
                    break;
                    
                case 'getSettings':
                    sendResponse({
                        autoStartEnabled: this.autoStartEnabled,
                        lastProject: this.lastProject
                    });
                    break;
            }
        });
    }
    
    startTimer(duration, type, project) {
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.originalDuration = duration * 60; // convertir a segundos
        this.timeRemaining = this.originalDuration;
        
        // Guardar el último proyecto si es de trabajo
        if (type === 'work' && project) {
            this.lastProject = project;
            this.saveSettings();
        }
        
        this.currentSession = {
            type: type, // 'work' or 'break'
            project: project,
            startTime: this.startTime,
            duration: duration
        };
        
        // Crear alarma para cuando termine el tiempo
        chrome.alarms.create('pomodoroTimer', {
            delayInMinutes: duration
        });
        
        // Actualizar badge inmediatamente al iniciar
        this.updateBadge();
        
        this.startBackgroundCountdown();
        this.saveTimerState();
    }
    
    startBackgroundCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            if (!this.isRunning || this.isPaused) {
                clearInterval(this.countdownInterval);
                return;
            }
            
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.timeRemaining = Math.max(0, this.originalDuration - elapsed);
            
            // Actualizar el badge del ícono con los minutos restantes
            this.updateBadge();
            
            // Notificar a la UI si está abierta
            this.notifyUI('timerTick', { 
                timeRemaining: this.timeRemaining,
                isRunning: this.isRunning,
                isPaused: this.isPaused,
                currentSession: this.currentSession
            });
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.countdownInterval);
                this.handleTimerComplete();
            }
        }, 1000);
    }
    
    getActualTimeRemaining() {
        if (!this.isRunning || this.isPaused) {
            return this.timeRemaining;
        }
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        return Math.max(0, this.originalDuration - elapsed);
    }
    
    updateBadge(minutes, mode) {
        const text = minutes > 0 ? minutes.toString() : '';
        const color = mode === 'work' ? '#e74c3c' : mode === 'break' ? '#27ae60' : '#666666';
        
        chrome.action.setBadgeText({ text });
        chrome.action.setBadgeBackgroundColor({ color });
    }
    
    updatePausedBadge() {
        if (this.isPaused && this.currentSession) {
            const minutes = Math.ceil(this.timeRemaining / 60);
            const badgeText = minutes > 0 ? minutes.toString() : '⏰';
            
            // Color gris para indicar que está pausado
            chrome.action.setBadgeText({ text: badgeText });
            chrome.action.setBadgeBackgroundColor({ color: '#95a5a6' });
        }
    }
    
    pauseTimer() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.timeRemaining = this.getActualTimeRemaining();
            chrome.alarms.clear('pomodoroTimer');
            
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
            }
            
            // Actualizar badge para mostrar estado pausado
            this.updatePausedBadge();
            
            this.saveTimerState();
        }
    }
    
    resumeTimer() {
        if (this.isPaused && this.currentSession) {
            this.isPaused = false;
            this.isRunning = true;
            this.startTime = Date.now();
            this.originalDuration = this.timeRemaining;
            
            // Crear nueva alarma con el tiempo restante
            const remainingMinutes = this.timeRemaining / 60;
            chrome.alarms.create('pomodoroTimer', {
                delayInMinutes: remainingMinutes
            });
            
            this.startBackgroundCountdown();
            this.saveTimerState();
        }
    }
    
    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = null;
        this.timeRemaining = 0;
        this.startTime = 0;
        this.originalDuration = 0;
        
        chrome.alarms.clear('pomodoroTimer');
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        // Limpiar badge cuando se resetea el timer
        this.updateBadge();
        
        this.saveTimerState();
    }
    
    startCountdown() {
        const countdownInterval = setInterval(() => {
            if (!this.isRunning || this.isPaused) {
                clearInterval(countdownInterval);
                return;
            }
            
            this.timeRemaining--;
            
            if (this.timeRemaining <= 0) {
                clearInterval(countdownInterval);
                this.handleTimerComplete();
            }
        }, 1000);
    }
    
    async loadTimerState() {
        try {
            const result = await chrome.storage.local.get(['timerState']);
            const state = result.timerState;
            
            if (state && state.isRunning) {
                this.isRunning = state.isRunning;
                this.isPaused = state.isPaused;
                this.currentSession = state.currentSession;
                this.startTime = state.startTime;
                this.originalDuration = state.originalDuration;
                
                if (!this.isPaused) {
                    // Calcular tiempo restante basado en tiempo transcurrido
                    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                    this.timeRemaining = Math.max(0, this.originalDuration - elapsed);
                    
                    if (this.timeRemaining > 0) {
                        // Reiniciar el countdown y la alarma
                        const remainingMinutes = this.timeRemaining / 60;
                        chrome.alarms.create('pomodoroTimer', {
                            delayInMinutes: remainingMinutes
                        });
                        this.startBackgroundCountdown();
                    } else {
                        // El timer ya debería haber terminado
                        this.handleTimerComplete();
                    }
                } else {
                    this.timeRemaining = state.timeRemaining;
                }
            }
            
            // Actualizar badge después de cargar el estado
            this.updateBadge();
        } catch (error) {
            console.error('Error loading timer state:', error);
        }
    }
    
    async saveTimerState() {
        try {
            const state = {
                isRunning: this.isRunning,
                isPaused: this.isPaused,
                currentSession: this.currentSession,
                timeRemaining: this.timeRemaining,
                startTime: this.startTime,
                originalDuration: this.originalDuration
            };
            
            await chrome.storage.local.set({ timerState: state });
        } catch (error) {
            console.error('Error saving timer state:', error);
        }
    }
    
    async handleTimerComplete() {
        // Prevenir múltiples ejecuciones
        if (this.isCompletingTimer) {
            return;
        }
        
        this.isCompletingTimer = true;
        
        const session = this.currentSession;
        
        if (!session) {
            this.isCompletingTimer = false;
            return;
        }

        // NUEVO: Usar el sistema de alertas mejorado
        await this.alertManager.triggerSessionAlert(session.type, {
            duration: session.duration,
            project: session.project,
            autoStart: session.type === 'work' || (session.type === 'break' && this.autoStartEnabled)
        });
        
        // Guardar estadísticas
        await this.saveSession(session);
        
        // Obtener configuraciones para inicio automático
        const settings = await this.getStoredSettings();
        console.log('⚙️ Configuraciones cargadas:', settings);
        
        // Determinar si iniciar automáticamente la siguiente sesión
        console.log('🔄 Evaluando inicio automático...');
        
        const nextType = session.type === 'work' ? 'break' : 'work';
        let shouldAutoStart = false;
        
        // LÓGICA DIFERENCIADA:
        if (session.type === 'work') {
            // Después del TRABAJO, SIEMPRE iniciar pausa automáticamente
            shouldAutoStart = true;
            console.log('💼 Trabajo completado -> Iniciando pausa automáticamente');
        } else {
            // Después de la PAUSA, solo iniciar trabajo si está habilitado
            shouldAutoStart = this.autoStartEnabled;
            console.log('☕ Pausa completada -> Auto-inicio de trabajo:', shouldAutoStart ? 'SÍ' : 'NO');
        }
        
        if (shouldAutoStart) {
            let nextProject = null;
            
            // Si la siguiente sesión es de trabajo, usar el último proyecto
            if (nextType === 'work') {
                nextProject = this.lastProject || session.project;
            }
            
            // Obtener duración para la siguiente sesión
            const settings = await this.getStoredSettings();
            const nextDuration = nextType === 'work' 
                ? settings.workTime || 25 
                : settings.breakTime || 5;
            
            console.log('🔄 Preparando inicio automático:');
            console.log('  - Tipo anterior:', session.type);
            console.log('  - Próximo tipo:', nextType);
            console.log('  - Próximo proyecto:', nextProject);
            console.log('  - Próxima duración:', nextDuration, 'minutos');
            
            // SIEMPRE notificar que se completó una sesión (para actualizar historial)
            this.notifyUI('timerComplete', { type: session.type });
            
            console.log('⏰ Iniciando countdown de 3 segundos para próxima sesión...');
            
            // Iniciar automáticamente la siguiente sesión después de un breve delay
            setTimeout(() => {
                console.log('🚀 Iniciando automáticamente próxima sesión:', nextType, nextDuration, 'min');
                this.isCompletingTimer = false; // Permitir nuevas ejecuciones
                this.startTimer(nextDuration, nextType, nextProject);
            }, 3000); // 3 segundos de delay para que el usuario vea la notificación y la barra lateral
            
        } else {
            console.log('⏸️ Sin inicio automático - solo notificando finalización');
            // Solo resetear sin iniciar automáticamente
            this.resetTimer();
            
            // Notificar a la UI que el timer ha terminado
            this.notifyUI('timerComplete', { type: session.type });
            
            this.isCompletingTimer = false; // Permitir nuevas ejecuciones
        }
        
        // Si no hay auto-start, limpiar el badge
        if (!this.autoStartEnabled) {
            this.updateBadge();
        }
    }
    
    showNotification(type) {
        // Prevenir notificaciones duplicadas
        const currentTime = Date.now();
        const notificationKey = `${type}-${Math.floor(currentTime / 5000)}`; // Agrupar por 5 segundos
        
        if (this.lastNotificationId === notificationKey) {
            console.log('⚠️ Notificación duplicada previenida para:', type);
            return;
        }
        
        this.lastNotificationId = notificationKey;
        
        // Determinar el mensaje según el nuevo comportamiento diferenciado
        let title, message, nextAction;
        
        if (type === 'work') {
            title = '🎉 ¡Sesión de trabajo completada!';
            message = 'Excelente trabajo. El descanso iniciará automáticamente en 3 segundos.';
            nextAction = 'Pausa automática iniciando...';
        } else {
            title = '☕ ¡Descanso terminado!';
            if (this.autoStartEnabled) {
                message = 'El descanso ha terminado. El trabajo iniciará automáticamente en 3 segundos.';
                nextAction = 'Trabajo automático iniciando...';
            } else {
                message = 'El descanso ha terminado. Presiona "Iniciar" cuando estés listo para trabajar.';
                nextAction = 'Auto-inicio de trabajo deshabilitado';
            }
        }
        
        const notificationId = `pomodoro-${type}-${Date.now()}`;
        
        // Crear notificación del sistema CON SONIDO
        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message,
            requireInteraction: true,
            priority: 2,
            // NO incluir silent: false (Chrome lo maneja automáticamente)
            buttons: [
                { title: '🍅 Abrir Pomodoro' },
                { title: '📊 Ver Estadísticas' }
            ]
        });
        
        console.log('🔔 Notificación del sistema creada:', notificationId, type);
        
        // NO abrir automáticamente la barra lateral - solo cuando el usuario interactúe
        // this.openSidePanel(); // <-- Removido para evitar error de user gesture
        
        // Auto-cerrar la notificación después de 8 segundos
        setTimeout(() => {
            chrome.notifications.clear(notificationId);
        }, 8000);
        
        // Manejar clicks en los botones de notificación
        const buttonClickHandler = (notifId, buttonIndex) => {
            if (notifId === notificationId) {
                if (buttonIndex === 0) {
                    // Abrir la barra lateral (aquí SÍ funciona porque es respuesta a user gesture)
                    this.openSidePanel();
                } else if (buttonIndex === 1) {
                    // Abrir historial/estadísticas
                    this.openSidePanel();
                    // Enviar mensaje para abrir el historial
                    setTimeout(() => {
                        this.notifyUI('openHistory', {});
                    }, 1000);
                }
                chrome.notifications.clear(notifId);
                chrome.notifications.onButtonClicked.removeListener(buttonClickHandler);
            }
        };
        
        // Manejar click general en la notificación
        const clickHandler = (notifId) => {
            if (notifId === notificationId) {
                // Abrir la barra lateral (aquí SÍ funciona porque es respuesta a user gesture)
                this.openSidePanel();
                chrome.notifications.clear(notifId);
                chrome.notifications.onClicked.removeListener(clickHandler);
                chrome.notifications.onButtonClicked.removeListener(buttonClickHandler);
            }
        };
        
        chrome.notifications.onButtonClicked.addListener(buttonClickHandler);
        chrome.notifications.onClicked.addListener(clickHandler);
    }
    
    async openSidePanel() {
        try {
            // Obtener la ventana activa - usar populated para obtener tabs
            const windows = await chrome.windows.getAll({ populate: true });
            const activeWindow = windows.find(window => window.focused) || windows[0];
            
            if (activeWindow) {
                // Abrir el side panel en la ventana activa
                await chrome.sidePanel.open({ windowId: activeWindow.id });
            } else {
                // Fallback: abrir en la ventana actual
                await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
            }
        } catch (error) {
            console.error('Error opening side panel:', error);
            // Fallback: intentar abrir sin especificar windowId
            try {
                await chrome.sidePanel.open({});
            } catch (fallbackError) {
                console.error('Fallback error opening side panel:', fallbackError);
                console.log('💡 Side panel se abrirá cuando el usuario interactúe con la extensión');
            }
        }
    }
    
    playNotificationSound() {
        // Crear un contexto de audio para el sonido de notificación
        // Esto se maneja mejor desde el sidebar ya que background scripts tienen limitaciones
        this.notifyUI('playSound', {});
    }
    
    async saveSession(session) {
        console.log('🟡 Intentando guardar sesión:', session);
        try {
            // Obtener datos existentes
            const result = await chrome.storage.local.get(['sessions', 'projectStats', 'dailyStats']);
            const sessions = result.sessions || [];
            const projectStats = result.projectStats || {};
            const dailyStats = result.dailyStats || {};
            
            console.log('🟡 Datos existentes - Sesiones:', sessions.length, 'Proyectos:', Object.keys(projectStats).length);
            
            const now = new Date();
            const dateString = now.toDateString();
            const isoDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Crear registro de sesión detallado
            const sessionRecord = {
                id: Date.now(),
                type: session.type,
                project: session.project || 'Sin proyecto',
                duration: session.duration, // en minutos
                durationSeconds: session.duration * 60,
                startTime: session.startTime,
                completedAt: Date.now(),
                date: dateString,
                isoDate: isoDate,
                dayOfWeek: now.toLocaleDateString('es-ES', { weekday: 'long' }),
                month: now.toLocaleDateString('es-ES', { month: 'long' }),
                year: now.getFullYear(),
                weekNumber: this.getWeekNumber(now)
            };
            
            sessions.push(sessionRecord);
            
            // Actualizar estadísticas del proyecto (solo sesiones de trabajo)
            if (session.project && session.type === 'work') {
                if (!projectStats[session.project]) {
                    projectStats[session.project] = {
                        name: session.project,
                        totalTime: 0, // en minutos
                        totalTimeSeconds: 0,
                        sessionsCompleted: 0,
                        averageSession: 0,
                        firstSession: isoDate,
                        lastSession: isoDate,
                        streak: 0,
                        bestStreak: 0
                    };
                }
                
                const stats = projectStats[session.project];
                stats.totalTime += session.duration;
                stats.totalTimeSeconds += session.duration * 60;
                stats.sessionsCompleted++;
                stats.averageSession = Math.round(stats.totalTime / stats.sessionsCompleted);
                stats.lastSession = isoDate;
                
                // Calcular racha (días consecutivos trabajando en el proyecto)
                this.updateProjectStreak(stats, isoDate, sessions, session.project);
            }
            
            // Actualizar estadísticas diarias
            if (!dailyStats[isoDate]) {
                dailyStats[isoDate] = {
                    date: isoDate,
                    workSessions: 0,
                    breakSessions: 0,
                    totalWorkTime: 0,
                    totalBreakTime: 0,
                    projects: []  // Inicializar como Array
                };
            }
            
            const dayStats = dailyStats[isoDate];
            
            // Asegurar que projects sea un Array
            if (!Array.isArray(dayStats.projects)) {
                dayStats.projects = dayStats.projects ? Array.from(dayStats.projects) : [];
            }
            
            if (session.type === 'work') {
                dayStats.workSessions++;
                dayStats.totalWorkTime += session.duration;
                if (session.project && !dayStats.projects.includes(session.project)) {
                    dayStats.projects.push(session.project);
                }
            } else {
                dayStats.breakSessions++;
                dayStats.totalBreakTime += session.duration;
            }
            
            // Guardar en storage
            await chrome.storage.local.set({
                sessions: sessions,
                projectStats: projectStats,
                dailyStats: dailyStats
            });
            
            console.log('✅ Sesión guardada exitosamente. Total sesiones:', sessions.length);
            console.log('✅ Última sesión guardada:', sessionRecord);
            
            // Verificación adicional: leer inmediatamente lo que se guardó
            const verification = await chrome.storage.local.get(['sessions']);
            console.log('🔍 Verificación inmediata - sesiones en storage:', verification.sessions?.length || 0);
            
        } catch (error) {
            console.error('❌ Error saving session:', error);
        }
    }
    
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    updateProjectStreak(stats, currentDate, sessions, projectName) {
        // Obtener sesiones de trabajo de este proyecto ordenadas por fecha
        const projectSessions = sessions
            .filter(s => s.type === 'work' && s.project === projectName)
            .map(s => s.isoDate)
            .sort();
        
        // Calcular racha actual
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 1;
        
        for (let i = 1; i < projectSessions.length; i++) {
            const prevDate = new Date(projectSessions[i - 1]);
            const currDate = new Date(projectSessions[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
                tempStreak++;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 1;
            }
        }
        
        maxStreak = Math.max(maxStreak, tempStreak);
        
        // La racha actual es la última secuencia que incluye hoy
        const today = new Date().toISOString().split('T')[0];
        if (projectSessions.includes(today)) {
            currentStreak = tempStreak;
        }
        
        stats.streak = currentStreak;
        stats.bestStreak = Math.max(stats.bestStreak, maxStreak);
    }
    
    notifyUI(action, data) {
        console.log('📤 Enviando mensaje a UI:', action, data);
        // Enviar mensaje a todas las tabs con la extensión abierta
        chrome.runtime.sendMessage({
            action: action,
            data: data
        }).then(() => {
            console.log('✅ Mensaje enviado exitosamente:', action);
        }).catch((error) => {
            console.log('⚠️ No hay receptores para el mensaje:', action, error.message);
        });
    }
    
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['autoStartEnabled', 'lastProject']);
            this.autoStartEnabled = result.autoStartEnabled !== undefined ? result.autoStartEnabled : true;
            this.lastProject = result.lastProject || null;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                autoStartEnabled: this.autoStartEnabled,
                lastProject: this.lastProject
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
    
    async getStoredSettings() {
        try {
            const result = await chrome.storage.local.get(['workTime', 'breakTime', 'autoStartEnabled']);
            return {
                workTime: result.workTime || 25,
                breakTime: result.breakTime || 5,
                autoStartEnabled: result.autoStartEnabled !== undefined ? result.autoStartEnabled : true
            };
        } catch (error) {
            console.error('Error getting stored settings:', error);
            return {
                workTime: 25,
                breakTime: 5,
                autoStartEnabled: true
            };
        }
    }
    
    async setAutoStart(enabled) {
        this.autoStartEnabled = enabled;
        await this.saveSettings();
        
        // Notificar a la UI del cambio
        this.notifyUI('autoStartChanged', { enabled: enabled });
    }
}

// Clase principal que coordina todos los componentes
class PomodoroBackground {
    constructor() {
        this.alertManager = new EnhancedAlertManager();
        this.timerManager = new TimerManager(this.alertManager);
        this.autoStartEnabled = true;
        this.lastProject = '';
        
        this.init();
    }

    async init() {
        await this.alertManager.loadAlertSettings();
        await this.loadSettings();
        await this.timerManager.loadTimerState();
        this.setupMessageHandlers();
    }

    setupMessageHandlers() {
        chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
            try {
                switch (message.action) {
                    case 'startTimer':
                        this.timerManager.startTimer(message.duration, message.type, message.project);
                        sendResponse({ success: true });
                        break;
                        
                    case 'pauseTimer':
                        this.timerManager.pauseTimer();
                        sendResponse({ success: true });
                        break;
                        
                    case 'resumeTimer':
                        this.timerManager.resumeTimer();
                        sendResponse({ success: true });
                        break;
                        
                    case 'resetTimer':
                        this.timerManager.resetTimer();
                        sendResponse({ success: true });
                        break;
                        
                    case 'getTimerState':
                        sendResponse({
                            isRunning: this.timerManager.isRunning,
                            isPaused: this.timerManager.isPaused,
                            timeRemaining: this.timerManager.timeRemaining,
                            currentSession: this.timerManager.currentSession
                        });
                        break;
                        
                    case 'setAutoStart':
                        await this.setAutoStart(message.enabled);
                        sendResponse({ success: true });
                        break;
                        
                    case 'getSettings':
                        sendResponse({
                            autoStartEnabled: this.autoStartEnabled,
                            lastProject: this.lastProject
                        });
                        break;

                    // Nuevos handlers para alertas
                    case 'updateAlertSettings':
                        this.alertManager.updateAlertSetting(message.setting, message.value);
                        sendResponse({ success: true });
                        break;
                        
                    case 'getAlertSettings':
                        sendResponse(this.alertManager.getAlertSettings());
                        break;
                        
                    case 'triggerTestAlert':
                        // Probar el sistema de alertas
                        await this.alertManager.triggerSessionAlert(message.type, {
                            duration: 25,
                            project: 'Proyecto de Prueba',
                            autoStart: true
                        });
                        sendResponse({ success: true });
                        break;
                        
                    case 'showProminentAlert':
                        // Esto se maneja en el sidebar
                        break;
                        
                    case 'showBrowserAlert':
                        // Mostrar alert nativo en el contexto apropiado
                        if (chrome.tabs && chrome.tabs.query) {
                            try {
                                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                                if (tabs[0]) {
                                    await chrome.scripting.executeScript({
                                        target: { tabId: tabs[0].id },
                                        func: (message) => alert(message),
                                        args: [message.message]
                                    });
                                }
                            } catch (error) {
                                console.warn('No se pudo mostrar alert nativo:', error);
                            }
                        }
                        break;
                }
            } catch (error) {
                console.error('Error handling message:', error);
                sendResponse({ success: false, error: error.message });
            }
            return true;
        });

        // Handler para clics en notificaciones
        chrome.notifications.onClicked.addListener((notificationId) => {
            this.alertManager.openSidebarWithAlert('notification-click', {});
        });

        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
            if (buttonIndex === 0) { // Abrir Pomodoro
                this.alertManager.openSidebarWithAlert('button-click', {});
            } else if (buttonIndex === 1) { // Configurar Alertas
                this.alertManager.openSidebarWithAlert('settings', {});
            } else if (buttonIndex === 2) { // Ver Estadísticas
                this.alertManager.openSidebarWithAlert('stats', {});
            }
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['autoStartEnabled', 'lastProject']);
            this.autoStartEnabled = result.autoStartEnabled !== undefined ? result.autoStartEnabled : true;
            this.lastProject = result.lastProject || '';
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.local.set({
                autoStartEnabled: this.autoStartEnabled,
                lastProject: this.lastProject
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    async setAutoStart(enabled) {
        this.autoStartEnabled = enabled;
        await this.saveSettings();
        
        // Notificar a la UI del cambio
        this.notifyUI('autoStartChanged', { enabled: enabled });
    }

    notifyUI(action, data) {
        chrome.runtime.sendMessage({ action, ...data }).catch(() => {
            // Ignorar errores si no hay UI escuchando
        });
    }
}

// Inicializar el background script
const pomodoroBackground = new PomodoroBackground();

// Configurar el contexto del side panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

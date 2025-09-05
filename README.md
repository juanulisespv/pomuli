# 🍅 Pomuli - Advanced Pomodoro Timer Extension

Una extensión avanzada de Chrome para la técnica Pomodoro con un **sistema de alertas mejorado** que garantiza que nunca te pierdas el final o inicio de una sesión.

## ✨ Características Principales

### 🔔 Sistema de Alertas Avanzado
- **Notificaciones del sistema** con sonido nativo
- **Alertas sonoras personalizables** (tono del sistema, campana, carillón)
- **Parpadeo del icono de la extensión** en la barra de herramientas
- **Auto-apertura del sidebar** con mensaje prominente
- **Alertas nativas del navegador** (opcional)
- **Vibración en dispositivos móviles** (si es compatible)
- **Repetición de notificaciones** para mayor insistencia
- **Configuración de intensidad** (baja, media, alta)

### ⏰ Gestión de Tiempo
- Temporizador Pomodoro clásico (25 min trabajo, 5 min descanso)
- Tiempos personalizables para trabajo y descansos
- Auto-inicio configurable de sesiones
- Sistema de pausa/reanudación
- Badge en tiempo real mostrando minutos restantes

### 📊 Seguimiento y Estadísticas
- Seguimiento de proyectos con estadísticas detalladas
- Historial completo de sesiones
- Estadísticas diarias, semanales y mensuales
- Exportación de datos en JSON y CSV
- Gestión avanzada de proyectos

## � Instalación

### Desde el código fuente:
1. Clona este repositorio: `git clone https://github.com/juanulisespv/pomuli.git`
2. Abre Chrome y ve a `chrome://extensions/`
3. Activa el "Modo de desarrollador"
4. Haz clic en "Cargar extensión sin empaquetar"
5. Selecciona la carpeta del proyecto

## 📋 Uso

### Configuración Básica
1. Haz clic en el icono de la extensión en la barra de herramientas
2. Selecciona un proyecto o crea uno nuevo
3. Ajusta los tiempos de trabajo y descanso según tus preferencias
4. ¡Presiona "Iniciar" y comienza a trabajar!

### Configuración de Alertas 🔧
1. En el sidebar, haz clic en "⚙️ Configurar Alertas"
2. Personaliza tu experiencia:
   - **Notificaciones del sistema**: Alertas nativas del SO
   - **Sonidos de alerta**: Tonos personalizables
   - **Parpadeo del icono**: Efecto visual en la barra de herramientas
   - **Auto-abrir sidebar**: Muestra automáticamente el panel
   - **Alerta del navegador**: Ventana de alerta nativa
   - **Vibración**: Para dispositivos móviles
   - **Repetir notificaciones**: Recordatorios persistentes

3. Ajusta la intensidad y duración de las alertas
4. Prueba tu configuración con "🧪 Probar Todas las Alertas"

### Tipos de Alertas Disponibles

#### 🔊 Alertas Sonoras
- **Sistema (predeterminado)**: Usa los sonidos nativos del navegador
- **Campana**: Tono de campana clásico
- **Carillón**: Sonido melódico suave
- **Personalizado**: (Próximamente) Carga tus propios sonidos

#### 👁️ Alertas Visuales
- **Parpadeo del icono**: El icono de la extensión parpadea con un badge de exclamación
- **Alerta prominente**: Overlay a pantalla completa con mensaje destacado
- **Badge dinámico**: Muestra minutos restantes en tiempo real

#### 📱 Alertas Táctiles
- **Vibración**: Patrones diferentes para trabajo vs. descanso
- **Repetición**: Recordatorios cada 30 segundos (máximo 3 veces)

### Configuración de Intensidad

#### 🟢 Baja
- Notificaciones discretas
- Sin repeticiones
- Duración corta del parpadeo

#### 🟡 Media (Recomendada)
- Notificaciones estándar
- Parpadeo moderado (5 segundos)
- Balance entre discreción y efectividad

#### 🔴 Alta
- Notificaciones persistentes
- Parpadeo prolongado (10 segundos)
- Repeticiones habilitadas
- Todas las alertas activadas

## 🛠️ Tecnologías Utilizadas

- **Chrome Extension Manifest V3**
- **Chrome APIs**: 
  - `chrome.notifications` - Notificaciones del sistema
  - `chrome.sidePanel` - Panel lateral
  - `chrome.action` - Badge y icono dinámico
  - `chrome.alarms` - Temporizadores en background
  - `chrome.storage` - Persistencia de datos
  - `chrome.scripting` - Alertas nativas
- **Web Audio API** - Generación de sonidos personalizados
- **Vibration API** - Alertas táctiles
- **HTML5/CSS3/JavaScript** - Interfaz moderna y responsiva

## 🎯 Características Técnicas Avanzadas

### Sistema de Prevención de Duplicados
- Previene notificaciones múltiples simultáneas
- Agrupa alertas por ventanas de tiempo de 5 segundos
- Gestión inteligente de estados de timer

### Gestión de User Gestures
- Auto-apertura del sidebar respetando las políticas de Chrome
- Fallbacks para diferentes contextos de usuario
- Manejo robusto de errores de permisos

### Persistencia Avanzada
- Estado del timer se mantiene entre sesiones
- Configuraciones de alertas personalizadas guardadas
- Sincronización automática entre background y UI

### Arquitectura Modular
- `EnhancedAlertManager`: Sistema completo de alertas
- `TimerManager`: Lógica de temporizador
- `PomodoroBackground`: Coordinador principal
- `PomodoroUI`: Interfaz de usuario reactiva

## 🔧 Configuración Avanzada

### Archivos de Configuración
```javascript
// Configuración predeterminada de alertas
{
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
}
```

### Personalización de Sonidos
1. Los sonidos se generan usando Web Audio API
2. Frecuencias diferentes para trabajo (800Hz) vs. descanso (600Hz)
3. Patrones de duración variables según el tipo de sesión

## 📈 Próximas Características

- [ ] Sonidos personalizados (carga de archivos MP3/WAV)
- [ ] Integración con calendarios (Google Calendar, Outlook)
- [ ] Temas visuales personalizables
- [ ] Sincronización en la nube
- [ ] Integración con herramientas de productividad (Notion, Trello)
- [ ] Análisis de productividad con IA
- [ ] Modo de enfoque profundo (bloqueo de distracciones)

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

1. Abre un issue en GitHub
2. Describe el problema detalladamente
3. Incluye información del navegador y SO
4. Adjunta screenshots si es necesario

## 🏆 Créditos

Desarrollado con ❤️ para mejorar la productividad y garantizar que nunca te pierdas una sesión Pomodoro.

---

**¿Te gusta Pomuli?** ⭐ Dale una estrella al repositorio y compártelo con tus amigos!

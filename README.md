# 🍅 Pomuli - Extensión Chrome Pomodoro

Una extensión moderna de Chrome que implementa la técnica Pomodoro con seguimiento de proyectos, estadísticas detalladas y diseño responsive.

## ✨ Características Principales

### � **Timer Pomodoro Completo**
- Temporizador de 25 minutos para trabajo y 5 minutos para descanso
- Control de pausa/reanudar/reiniciar
- Persistencia en background (funciona aunque cierres la sidebar)
- Notificaciones del sistema al completar sesiones
- Funciona en segundo plano

### � **Seguimiento de Proyectos**
- Selección y creación de proyectos personalizados
- Estadísticas por proyecto (tiempo total, sesiones completadas)
- Historial detallado con filtros avanzados

### � **Funciones Avanzadas**
- **Inicio automático**: Transición automática entre trabajo y descanso
- **Apertura automática**: La sidebar se abre automáticamente al terminar sesiones de trabajo
- **Notificaciones prominentes**: Notificaciones del sistema con botones interactivos
- **Exportación de datos**: CSV y JSON del historial completo

### 🎨 **Diseño Moderno**
- Interfaz responsive y atractiva con gradientes
- Modo oscuro automático según preferencias del sistema
- Animaciones fluidas y micro-interacciones
- Diseño optimizado para pantallas pequeñas

## 🛠️ Instalación

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/pomuli.git
   cd pomuli
   ```

2. **Instala en Chrome**:
   - Abre `chrome://extensions/`
   - Activa "Modo de desarrollador"
   - Haz clic en "Cargar extensión sin empaquetar"
   - Selecciona la carpeta `pomuli`

3. **¡Listo!** La extensión aparecerá en la barra lateral de Chrome

## 🎯 Uso

### Iniciar una Sesión
1. Selecciona o crea un proyecto
2. Haz clic en "Iniciar" 
3. ¡Trabaja durante 25 minutos!

### Ver Estadísticas
- **Hoy**: Sesiones completadas del día actual
- **Total**: Tiempo acumulado de todas las sesiones
- **Historial**: Registro completo con filtros por proyecto, período y tipo

### Configuración
- **Tiempos personalizados**: Ajusta duración de trabajo y descanso
- **Inicio automático**: Activa/desactiva transiciones automáticas

## 🔧 Desarrollo

### Estructura del Proyecto
```
pomuli/
├── manifest.json          # Configuración de la extensión
├── background.js           # Service Worker (lógica del timer)
├── sidebar.html           # Interfaz principal
├── sidebar.js             # Lógica de UI y comunicación
├── debug-storage.js       # Herramientas de debugging
├── styles/
│   └── sidebar.css        # Estilos modernos y responsive
└── icons/                 # Iconos de la extensión
```

### ⚠️ **PROBLEMA SOLUCIONADO: Funciones Duplicadas**

**Problema**: Existían dos funciones `handleTimerComplete` en `sidebar.js`, causando que la segunda sobrescribiera a la primera, lo que podía interferir con el guardado del historial.

**Solución**: 
- ✅ Eliminada la función duplicada
- ✅ Mantenida una sola función que maneja ambos casos (inicio automático y manual)
- ✅ Añadidos timeouts para dar tiempo al background a guardar los datos
- ✅ Mejora en la sincronización entre UI y background

### Funciones de Debug
La extensión incluye herramientas de debugging accesibles desde la consola:

```javascript
// Ver contenido del storage
debugStorage()

// Añadir sesión de prueba
addTestSession()

// Iniciar timer de 5 segundos para testing
startTestTimer()

// Limpiar storage (¡cuidado!)
clearStorage()
```

### APIs Utilizadas
- **Chrome Storage API**: Persistencia de datos
- **Chrome Alarms API**: Timer en background
- **Chrome Notifications API**: Notificaciones del sistema
- **Chrome Side Panel API**: Interfaz lateral

## 🐛 Resolución de Problemas

### El historial no se guarda
1. Abre las herramientas de desarrollador (F12)
2. Ve a la consola y ejecuta `debugStorage()`
3. Verifica si aparecen los logs de guardado de sesiones
4. Si no hay datos, usa `startTestTimer()` para probar

### La extensión no funciona después de cerrar Chrome
- Los Service Workers de Chrome pueden "dormirse"
- La extensión se reactiva automáticamente al abrir la sidebar
- Los datos persisten en `chrome.storage.local`

### Problemas de sincronización
- El timer principal funciona en background
- La UI se sincroniza automáticamente cada segundo
- Si hay desfase, la recarga de la extensión soluciona el problema

## 📈 Roadmap

- [ ] Sincronización en la nube
- [ ] Estadísticas semanales/mensuales
- [ ] Temas personalizables
- [ ] Integración con herramientas de productividad
- [ ] Sonidos personalizados para notificaciones

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

---

**¡Desarrollado con ❤️ para mejorar tu productividad!** 🚀

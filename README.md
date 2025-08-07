# Pastelería - Sistema de Gestión de Pedidos

Una aplicación móvil completa para la gestión de pedidos de pastelería, construida con React Native, Expo y siguiendo los principios SOLID.

## 🎯 Características

### Funcionalidades Principales
- **Gestión de Pedidos**: Crear, ver, editar y eliminar pedidos
- **Gestión de Productos**: CRUD completo para productos de pastelería
- **Gestión de Tamaños**: Administrar diferentes tamaños de productos
- **Autenticación**: Sistema de login y registro de usuarios
- **Dashboard**: Vista general con estadísticas y pedidos recientes
- **Búsqueda y Filtros**: Búsqueda avanzada y filtrado por estado de pedidos

### Características Técnicas
- **Arquitectura SOLID**: Implementación de principios de diseño sólidos
- **React Query**: Gestión eficiente de estado y caché
- **TypeScript**: Tipado estático para mayor seguridad
- **UI/UX Moderna**: Interfaz intuitiva y responsive
- **Navegación**: Sistema de navegación con Expo Router

## 🏗️ Arquitectura

### Principios SOLID Implementados

#### 1. Single Responsibility Principle (SRP)
- `ApiService`: Responsable únicamente de las llamadas HTTP
- `AuthContext`: Manejo exclusivo de autenticación
- Hooks personalizados: Cada uno con una responsabilidad específica

#### 2. Open/Closed Principle (OCP)
- Sistema de hooks extensible sin modificar código existente
- Componentes modales reutilizables

#### 3. Liskov Substitution Principle (LSP)
- Interfaces consistentes para productos y pedidos
- Implementación uniforme de operaciones CRUD

#### 4. Interface Segregation Principle (ISP)
- Interfaces específicas para cada tipo de dato
- Hooks especializados por funcionalidad

#### 5. Dependency Inversion Principle (DIP)
- Inyección de dependencias a través de contextos
- Abstracción de servicios de API

### Estructura de Carpetas

```
src/
├── types/           # Interfaces TypeScript
├── services/        # Capa de servicios (API)
├── hooks/          # Hooks personalizados (React Query)
├── contexts/       # Contextos de React
├── app/            # Pantallas y navegación
│   ├── (tabs)/     # Navegación por pestañas
│   ├── orders/     # Pantallas de pedidos
│   └── auth.tsx    # Pantalla de autenticación
└── components/     # Componentes reutilizables
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Expo CLI

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd mbswmoments
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env si es necesario
# Configurar URL de API en services/api.ts
```

4. **Ejecutar la aplicación**
```bash
npm start
```

### Dependencias Principales

```json
{
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0",
  "expo-router": "^3.0.0",
  "react-hook-form": "^7.48.0",
  "date-fns": "^2.30.0",
  "@react-native-community/datetimepicker": "^7.6.0"
}
```

## 📱 Pantallas y Funcionalidades

### 1. Autenticación (`/auth`)
- Login y registro de usuarios
- Validación de formularios
- Manejo de errores de autenticación

### 2. Dashboard (`/`)
- Estadísticas generales
- Pedidos recientes
- Acceso rápido a funcionalidades

### 3. Lista de Pedidos (`/explore`)
- Vista completa de pedidos
- Búsqueda y filtros
- Estados visuales (vencido, hoy, próximo)

### 4. Detalle de Pedido (`/orders/[id]`)
- Información completa del pedido
- Productos y características
- Cálculo de totales

### 5. Nuevo Pedido (`/orders/new`)
- Formulario de creación
- Selección de productos y tamaños
- Características personalizadas

### 6. Gestión de Productos (`/products`)
- CRUD completo de productos
- Búsqueda y filtros
- Estados activo/inactivo

## 🔧 API Integration

### Endpoints Principales

#### Autenticación
- `POST /user/register` - Registro de usuarios
- `POST /user/login` - Inicio de sesión
- `POST /user/logout` - Cierre de sesión

#### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PATCH /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

#### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos/:id` - Obtener pedido específico

### Configuración de API

```typescript
// services/api.ts
class ApiService {
  private baseURL = 'http://localhost:3000';
  // Configuración de axios con interceptores
}
```

## 🎨 UI/UX Design

### Paleta de Colores
- **Primario**: `#4ECDC4` (Turquesa)
- **Secundario**: `#2C3E50` (Azul oscuro)
- **Éxito**: `#27AE60` (Verde)
- **Error**: `#E74C3C` (Rojo)
- **Advertencia**: `#F39C12` (Naranja)
- **Neutro**: `#7F8C8D` (Gris)

### Componentes Reutilizables
- Modales para formularios
- Tarjetas de productos y pedidos
- Botones y inputs estilizados
- Indicadores de estado

## 📊 Gestión de Estado

### React Query
- Caché inteligente de datos
- Sincronización automática
- Manejo de estados de carga y error

### Context API
- Estado global de autenticación
- Persistencia de sesión

## 🔒 Seguridad

### Autenticación
- Tokens JWT con cookies HTTP-only
- Validación de sesión
- Logout automático en errores 401

### Validación
- Validación de formularios en cliente
- Sanitización de datos
- Manejo de errores robusto

## 🧪 Testing

### Estructura de Tests
```bash
# Ejecutar tests
npm test

# Tests de componentes
npm run test:components

# Tests de integración
npm run test:integration
```

## 📦 Build y Deploy

### Desarrollo
```bash
npm start
# Escanear QR con Expo Go
```

### Producción
```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios

# Build para web
expo build:web
```

## 🤝 Contribución

### Guías de Desarrollo
1. Seguir principios SOLID
2. Usar TypeScript para todo el código
3. Implementar tests para nuevas funcionalidades
4. Documentar cambios en README

### Estructura de Commits
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: cambios de estilo
refactor: refactorización
test: tests
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

---


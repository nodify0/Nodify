
# Documentación del Sistema de Nodos de Nodify

## 1. Introducción a los Nodos

Los nodos son los bloques de construcción fundamentales de cualquier flujo de trabajo en Nodify. Cada nodo representa una unidad de trabajo específica, como recibir datos, tomar una decisión, realizar una acción o transformar información. Al conectar estos nodos, creas una secuencia lógica que automatiza un proceso.

### Anatomía de un Nodo

Un nodo en el editor visual se compone de:

*   **Icono y Color:** Una representación visual para identificar rápidamente la función del nodo.
*   **Nombre:** Un título descriptivo que resume su propósito.
*   **Puertos de Entrada/Salida (Handles):** Puntos de conexión que permiten que los datos fluyan de un nodo a otro. Un nodo puede tener múltiples puertos de entrada y salida para manejar diferentes ramas del flujo de trabajo.

### Categorías de Nodos

Los nodos se organizan en grupos lógicos para facilitar su localización en la paleta:

*   **Triggers (Disparadores):** Nodos que inician un flujo de trabajo. No tienen puertos de entrada. Ejemplos: `Webhook`, `Cron`.
*   **Actions (Acciones):** Nodos que realizan una operación específica, como enviar un email o hacer una petición HTTP.
*   **Logic (Lógica):** Nodos que controlan el flujo del trabajo, como condicionales (`IF`) o fusiones de ramas (`Merge`).
*   **Data (Datos):** Nodos para manipular, leer o escribir datos, como `Data Store`.
*   **Layout (Diseño):** Nodos visuales que no ejecutan código, pero ayudan a organizar y documentar el flujo, como `Group Sticker`.

---

## 2. Configuración de Nodos

Para configurar un nodo, haz doble clic sobre él en el editor o utiliza el menú contextual (clic derecho -> Propiedades). Esto abrirá el **Panel de Propiedades**.

En este panel, puedes definir el comportamiento específico del nodo. Los campos que ves aquí están definidos en la propiedad `properties` del archivo JSON del nodo.

### Tipos de Propiedades Comunes:

*   **string:** Un campo de texto simple. Puede aceptar expresiones `{{...}}`.
*   **number:** Un campo para valores numéricos.
*   **boolean:** Un interruptor (toggle) para valores verdadero/falso.
*   **options:** Un menú desplegable para seleccionar una opción de una lista predefinida.
*   **json:** Un editor de texto para escribir datos en formato JSON.
*   **javascript:** Un editor de código con resaltado de sintaxis para escribir scripts de JavaScript.
*   **credentials:** Un desplegable especial para seleccionar credenciales guardadas (ej. API Keys).
*   **color:** Un selector de color.

*   **notice:** Muestra un bloque de texto estático. Útil para instrucciones o advertencias. Puede tener variantes de estilo (`default` o `destructive`).
*   **separator:** Una línea de separación visual, que puede incluir un texto centrado.
*   **button:** Un botón que puede realizar acciones predefinidas, como copiar un valor al portapapeles.
*   **checkbox:** Un grupo de casillas de verificación.
*   **radio:** Un grupo de botones de opción para selección única.

### 2.1. Pestaña de Pruebas para Webhooks (Test Tab)

Los nodos de tipo `Webhook` tienen una pestaña adicional en su panel de configuración llamada **"Test"**. Esta pestaña proporciona un conjunto de herramientas para facilitar la prueba y depuración de los webhooks sin necesidad de herramientas externas.

<img src="https://i.imgur.com/rG3hFzN.png" alt="Pestaña de Test para Webhooks" width="600"/>

Funcionalidades de la pestaña "Test":

*   **URL del Webhook:**
    *   Muestra la URL completa y única para tu webhook, incluyendo el token de autenticación.
    *   Un botón de **copiar** <img src="https://i.imgur.com/8aV19nU.png" alt="Copy Icon" width="16"/> te permite copiarla fácilmente al portapapeles.

*   **Ejemplo de cURL:**
    *   Proporciona un comando `cURL` de ejemplo listo para usar en tu terminal.
    *   Este comando envía una petición `POST` con un cuerpo JSON de ejemplo a la URL de tu webhook.
    *   También incluye un botón para **copiar** el comando.

*   **Botón "Listen for Webhook":**
    *   Al hacer clic, Nodify se pone en modo de "escucha" durante 60 segundos, esperando activamente una llamada al webhook.
    *   Cuando una llamada es recibida, se captura y se muestra automáticamente en la lista de llamadas recientes.
    *   El modo de escucha se detiene automáticamente al recibir una llamada o después de 60 segundos.

*   **Llamadas Recientes:**
    *   Muestra una lista de las últimas llamadas recibidas por el webhook.
    *   Puedes seleccionar una llamada de la lista para inspeccionar los datos que se recibieron.

*   **Visor de Datos:**
    *   Una vez que seleccionas una llamada, puedes ver en detalle:
        *   **Body:** El cuerpo de la petición (en formato JSON).
        *   **Headers:** Las cabeceras HTTP.
        *   **Query:** Los parámetros de consulta de la URL.

Este conjunto de herramientas te permite tener un flujo de trabajo de desarrollo y prueba muy eficiente, al estilo de herramientas como n8n, directamente dentro de Nodify.

---

## 3. El Contexto de Ejecución

La parte más poderosa de Nodify es la capacidad de escribir código JavaScript y expresiones directamente en los nodos. Cuando escribes este código, tienes acceso a varios objetos globales que contienen toda la información relevante en ese punto del flujo de trabajo.

### Estructura del Contexto

Dentro de un `executionCode` o al usar expresiones `{{...}}`, tienes acceso a:

```javascript
// El nodo actual que se está ejecutando
const node = {
  "name": "Nombre del Nodo",
  "description": "Descripción del nodo",
  "properties": {
    // Un objeto que contiene el VALOR de cada propiedad configurada en el panel
    "miPropiedadTexto": { "value": "Hola Mundo" },
    "miPropiedadNumero": { "value": 123 },
    // ... más propiedades
  }
};

// Los datos que fluyeron desde el nodo ANTERIOR
const data = {
  "userId": "user_abc",
  "email": "test@example.com",
  "payload": { /* ... */ }
};

// ¡NUEVO! El contexto completo de la ejecución actual ($)
const $ = {
  // Contiene los resultados de todos los nodos que ya se han ejecutado
  "id_del_nodo_webhook-123": {
    "input": { /* lo que recibió */ },
    "output": { /* lo que generó */ }
  },
  "id_del_nodo_anterior-456": {
    "input": { /* ... */ },
    "output": { /* ... */ }
  }
};


// También existen otras variables de entorno (funcionalidad futura)
const env = {};
```

### 3.1. Accediendo a los Datos de Entrada: `data`

Este objeto contiene la salida del **nodo inmediatamente anterior**. Es la forma más rápida de obtener los datos que acababan de llegar.

**Ejemplo:** Imagina que un nodo `Webhook` recibe una petición y la envía al siguiente nodo. El objeto `data` en ese siguiente nodo contendrá la salida completa del webhook.

```javascript
// En un nodo de Código, después de un Webhook
const username = data.body.username; // "NodifyFan"

return { message: `Bienvenido, ${username}!` };
```

### 3.2. Accediendo a los Datos de CUALQUIER Nodo Anterior: `$`

Este es el objeto más potente. Te permite acceder a la salida (o entrada) de **cualquier nodo que ya se haya ejecutado** en el flujo actual, usando su ID único. En el código, se conoce como `execution`, pero para las expresiones se usa el alias `$`.

**Ejemplo:** Tienes un flujo: `Webhook` -> `Delay` -> `HTTP Request`. En el último nodo (`HTTP Request`), quieres usar un dato que vino del primer nodo (`Webhook`).

El ID del nodo Webhook podría ser `webhook_trigger-1723588204235`.

Para usar la URL que vino en el cuerpo del webhook, podrías escribir en la propiedad URL del nodo `HTTP Request`:

`https://api.example.com/users/{{$['webhook_trigger-1723588204235'].output.body.userId}}`

El motor reemplazará `{{...}}` con el valor real de `userId` que se recibió en el webhook, sin importar cuántos nodos haya en medio.

### 3.3. Accediendo a las Propiedades del Nodo Actual: `node.properties`

Este objeto te permite leer los valores que el usuario ha configurado en el panel de propiedades del nodo actual.

**Ejemplo:** Tienes un nodo `HTTP Request` con una propiedad llamada `url`. Para acceder a su valor en el `executionCode`, usarías:

```javascript
const targetUrl = node.properties.url.value;
console.log(`Haciendo una petición a: ${targetUrl}`);
```

**¡Importante!** El valor real de la propiedad siempre está dentro de la clave `value`.

### 3.4. Retornando Datos

El `return` de tu código se convierte en el objeto `data` para el siguiente nodo en el flujo. Siempre deberías retornar un objeto.

### 3.5. Debug Logs y Helpers para Depuración

Nodify proporciona un sistema completo de logging que te permite depurar y monitorear la ejecución de tus nodos en tiempo real. Todos los logs se capturan y se muestran en la **pestaña Debug** del panel de configuración del nodo.

#### Helpers de Logging Disponibles

Dentro del `executionCode`, tienes acceso a los siguientes helpers para registrar información:

```javascript
// Log general de información
helpers.log('Iniciando proceso de validación');
helpers.log('Usuario encontrado:', userData);

// Mensajes de advertencia (warnings)
helpers.warn('El campo email está vacío, usando valor por defecto');

// Mensajes de error
helpers.error('Error al conectar con la API:', error.message);

// Información adicional (mismo que log, pero con color azul en la consola)
helpers.info('Configuración cargada correctamente');
```

#### Visualización de Logs en la UI

Después de ejecutar un workflow:

1. **Abre el panel de configuración** del nodo (doble clic o clic derecho → Propiedades)
2. **Ve a la pestaña "Debug"** (icono de Terminal)
3. **Selecciona el nodo** que deseas inspeccionar del dropdown
4. **Visualiza los logs** en formato de consola con:
   - **Timestamp**: Hora exacta de cada log (formato: HH:MM:SS.mmm)
   - **Tipo**: LOG, INFO, WARN, ERROR (con colores diferentes)
   - **Mensaje**: El contenido del log

**Ejemplo visual:**
```
12:34:56.789 [INFO]  Starting execution of HTTP Request
12:34:56.790 [LOG]   URL: https://api.example.com/users
12:34:56.791 [LOG]   Method: GET
12:34:56.792 [LOG]   Response Type: auto
12:34:57.123 [LOG]   Response status: 200 OK
12:34:57.124 [LOG]   Content-Type: application/json
12:34:57.125 [LOG]   Received JSON response
12:34:57.126 [INFO]  Execution completed successfully in 337ms
```

#### Mejores Prácticas para Logging

1. **Log al inicio del nodo:**
```javascript
helpers.log('Starting [Node Name] node');
```

2. **Log de configuración importante:**
```javascript
helpers.log(`Operation: ${operation}`);
helpers.log(`Input data type: ${Array.isArray(data) ? 'array' : typeof data}`);
```

3. **Log de decisiones y condiciones:**
```javascript
if (condition) {
  helpers.log('Condition evaluated to: true');
} else {
  helpers.log('Condition evaluated to: false');
}
```

4. **Log de resultados:**
```javascript
helpers.log(`Processed ${results.length} items successfully`);
```

5. **Log de errores con contexto:**
```javascript
helpers.error('Failed to parse JSON:', error.message);
helpers.error('Invalid input data:', JSON.stringify(data));
```

#### Ejemplo Completo de un Nodo con Logging

```javascript
try {
  helpers.log('Starting Data Validation node');

  const requiredFields = node.properties.requiredFields.value;
  helpers.log(`Required fields: ${requiredFields.join(', ')}`);

  const missingFields = [];

  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
      helpers.warn(`Missing field: ${field}`);
    }
  }

  if (missingFields.length > 0) {
    helpers.error(`Validation failed. Missing ${missingFields.length} fields`);
    return {
      valid: false,
      missingFields,
      error: 'Validation failed'
    };
  }

  helpers.log('Validation passed successfully');
  return { valid: true, data };

} catch (error) {
  helpers.error('Unexpected error during validation:', error.message);
  throw error;
}
```

#### Beneficios del Sistema de Logging

- ✅ **Debugging en tiempo real**: Ve exactamente qué está pasando dentro de cada nodo
- ✅ **Trazabilidad**: Rastrea el flujo de datos a través del workflow
- ✅ **Identificación de errores**: Detecta rápidamente dónde fallan los nodos
- ✅ **Monitoreo de rendimiento**: Ve cuánto tiempo toma cada operación
- ✅ **Sin herramientas externas**: Todo integrado en la UI de Nodify

---

## 3.6. Nodos Específicos

### form_submit_trigger

Este nodo de tipo `trigger` te permite crear formularios web complejos y personalizables que inician un flujo de trabajo cuando un usuario los envía.

#### Creación de Formularios

La configuración del formulario se realiza en la propiedad `formFields` del nodo. Esta propiedad utiliza un editor de formularios visual que te permite definir los campos, el estilo y el diseño del formulario en formato JSON.

Para una guía detallada sobre cómo crear y configurar formularios, consulta la [documentación de formularios](./forms.md).

#### Subida de Archivos

El nodo `form_submit_trigger` soporta la subida de archivos. Simplemente añade un campo de tipo `file` a tu formulario.

- **Almacenamiento:** Los archivos subidos se almacenan automáticamente en **Firebase Storage**.
- **Acceso a los Archivos:** La URL pública del archivo subido estará disponible en el objeto `files` dentro de los datos de salida del nodo.

**Ejemplo de datos de salida:**
```json
{
  "body": {
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  },
  "files": {
    "resume": "https://storage.googleapis.com/your-bucket/forms/form-123/1678886400000_resume.pdf"
  }
}
```

**Requisito:** Para que la subida de archivos funcione, debes configurar la variable de entorno `FIREBASE_STORAGE_BUCKET` en tu proyecto con el nombre de tu bucket de Firebase Storage.

### HTTP Request - Manejo de Archivos

El nodo `HTTP Request` puede detectar y manejar automáticamente respuestas que son archivos (imágenes, PDFs, ZIPs, etc.).

#### Detección Automática

Cuando el Response Type está en **"Auto-detect"**, el nodo detecta archivos basándose en:
- Content-Type: `image/*`, `video/*`, `audio/*`, `application/pdf`, `application/zip`, etc.
- Content-Disposition: presencia de `attachment`

#### Opciones de Response Type

- **Auto-detect**: Detecta automáticamente el tipo de respuesta
- **JSON**: Fuerza parseo como JSON
- **Text**: Fuerza lectura como texto plano
- **Binary/File**: Fuerza tratamiento como archivo binario

#### Almacenamiento de Archivos

Los archivos descargados se almacenan **temporalmente en memoria** usando el sistema de file-utils:

```javascript
// Respuesta cuando se descarga un archivo
{
  "type": "file",
  "file": {
    "id": "file_1234567890_abc123",     // ID único del archivo
    "name": "document.pdf",              // Nombre del archivo
    "mimeType": "application/pdf",       // Tipo MIME
    "size": 152400,                      // Tamaño en bytes
    "sizeFormatted": "148.83 KB"        // Tamaño formateado
  }
}
```

**Características del almacenamiento:**
- ✅ **Temporal**: Los archivos se auto-eliminan después de 1 hora
- ✅ **En memoria**: No persisten en disco ni entre recargas
- ✅ **Por ejecución**: Disponibles durante todo el workflow

#### Usar Archivos con File Handler

Una vez descargado un archivo con HTTP Request, puedes procesarlo con el nodo **File Handler**:

**Operaciones disponibles:**

1. **Download to Device**: Descarga el archivo al navegador del usuario
2. **Get Metadata**: Obtiene información del archivo (nombre, tamaño, tipo)
3. **Convert to Base64**: Convierte a Base64 para enviar a APIs
4. **Get Data URL**: Crea Data URL para mostrar en HTML

**Ejemplo de workflow:**

```
[HTTP Request] → Descarga imagen.jpg
       ↓
[File Handler: base64] → Convierte a Base64
       ↓
[HTTP Request] → Envía Base64 a API de procesamiento
```

**Código de ejemplo en File Handler:**

```javascript
// El File Handler detecta automáticamente el file ID desde data.file.id
const fileId = node.properties.fileId.value || data.file.id;

// Operaciones disponibles con helpers
const file = helpers.getFile(fileId);                    // Obtener archivo
const base64 = helpers.getFileAsBase64(fileId);          // Convertir a Base64
const dataUrl = helpers.getFileAsDataUrl(fileId);        // Crear Data URL
const downloadUrl = helpers.createFileDownloadUrl(fileId); // URL de descarga
const size = helpers.formatFileSize(file.size);          // Formatear tamaño
```

---

## 4. Creación y Estructura de un Nodo Personalizado

Los nodos se definen mediante archivos JSON en la carpeta `src/nodes`. Aquí se desglosa la estructura de un archivo de definición de nodo:

### 4.0. Mejores Prácticas: Debug Logging en Nodos Personalizados

**IMPORTANTE:** Todos los nodos deben incluir `helpers.log()`, `helpers.warn()`, y `helpers.error()` en su `executionCode` para facilitar el debugging. Estos logs se capturan automáticamente y se muestran en la pestaña Debug del panel de configuración.

**Puntos de logging obligatorios:**

1. ✅ **Log al inicio** de la ejecución indicando qué hace el nodo
2. ✅ **Log de valores de entrada** (especialmente de las propiedades del nodo)
3. ✅ **Log de decisiones clave** o condiciones evaluadas
4. ✅ **Log del resultado** antes de hacer `return`
5. ✅ **Log de warnings** para problemas no críticos con `helpers.warn()`
6. ✅ **Log de errores** para fallos con `helpers.error()`

**Ejemplo de estructura recomendada:**

```javascript
try {
  helpers.log('Starting [Node Name] node');

  // Log de configuración
  const myConfig = node.properties.myProperty.value;
  helpers.log(`Configuration: ${myConfig}`);

  // Log de entrada
  helpers.log(`Input data: ${JSON.stringify(data).substring(0, 100)}...`);

  // Lógica del nodo con logs de decisiones
  if (someCondition) {
    helpers.log('Condition met: processing data');
    // ... procesamiento
  } else {
    helpers.warn('Condition not met: using default behavior');
  }

  // Log de resultado
  helpers.log(`Operation completed successfully with ${result.count} items`);

  return result;

} catch (error) {
  helpers.error('Node execution failed:', error.message);
  helpers.error('Stack trace:', error.stack);
  throw error;
}
```

**Beneficios:**
- Los usuarios pueden ver exactamente qué pasó durante la ejecución
- Facilita el debugging de workflows complejos
- Ayuda a entender decisiones lógicas (como en nodos IF/Switch)
- Proporciona visibilidad en operaciones externas (APIs, bases de datos)



```json
{
  "id": "miNodoUnico",
  "version": "1.0",
  "name": "Mi Nodo Personalizado",
  "description": "Una breve descripción de lo que hace este nodo.",
  "group": "Actions", // ¿A qué grupo pertenece en la paleta?
  "category": "action", // trigger, action, logic, data, etc.
  "shape": "2x2", // Formato: VxH (vertical x horizontal slots). Opciones: 1x1 a 6x6, circle
  "color": "#3498DB", // Color del icono
  "icon": "Code2", // Nombre del icono de Lucide (ej. "Code2") o un ID de icono interno.
  "inputs": [
    {
      "id": "main",
      "label": "Input",
      "position": "left",  // 'left' o 'top' para inputs
      "slot": 1,            // Número de slot (1-based)
      "description": "Descripción del puerto (opcional)"
    }
  ],
  "outputs": [
    {
      "id": "main",
      "label": "Output",
      "position": "right", // 'right' o 'bottom' para outputs
      "slot": 1             // Número de slot (1-based)
    }
  ],
  "properties": [
    // Array de objetos de propiedades (ver abajo)
  ],
  "executionCode": "return { success: true, data: data };" // Código JS que se ejecuta
}
```

### El Objeto `properties`

Cada objeto en el array `properties` define un campo en el panel de configuración.

**Ejemplo de una propiedad de texto:**
```json
{ 
  "name": "apiKey", // El ID interno, usado en node.properties.apiKey
  "displayName": "API Key", // La etiqueta que ve el usuario
  "type": "string", // Tipo de campo
  "default": "", // Valor por defecto
  "required": true, 
  "placeholder": "Introduce tu API Key" 
}
```

### Visualización Condicional de Propiedades

Puedes hacer que una propiedad solo aparezca si otra tiene un valor específico usando `displayOptions`.

**Ejemplo:** Mostrar el campo `jsonBody` solo si `sendBody` es `true`.
```json
{
  "name": "sendBody",
  "displayName": "Send Body",
  "type": "boolean",
  "default": false
},
{
  "name": "jsonBody",
  "displayName": "JSON Body",
  "type": "json",
  "displayOptions": {
    "show": {
      "sendBody": [true] // Muestra este campo si 'sendBody' es true
    }
  }
}
```

### 4.1. Separación del Código de Ejecución (executionFile)

Para nodos con código JavaScript muy complejo y extenso, Nodify soporta la separación del código de ejecución en un archivo `.js` separado del archivo `.json` de definición.

#### ¿Cuándo usar executionFile?

Usa `executionFile` cuando:
- ✅ El código de ejecución del nodo es muy largo (>100 líneas)
- ✅ El código requiere resaltado de sintaxis completo en tu editor
- ✅ Quieres mantener el JSON de definición más limpio y legible
- ✅ El código tiene lógica compleja que es difícil de mantener en JSON

**Por defecto**, usa `executionCode` inline en el JSON para nodos simples.

#### Estructura de archivos

Cuando usas `executionFile`, necesitas crear **dos archivos** en la carpeta `src/nodes/`:

1. **Archivo JSON** (definición del nodo)
2. **Archivo JS** (código de ejecución)

Ambos archivos deben tener **el mismo nombre base** y estar en la **misma carpeta**.

**Ejemplo:**
```
src/nodes/
  ├── my_complex_node.json    ← Definición del nodo
  └── my_complex_node.js      ← Código de ejecución
```

#### Archivo JSON con executionFile

En el archivo `.json`, establece `executionFile: true` y **omite** la propiedad `executionCode`:

```json
{
  "id": "my_complex_node",
  "version": "1.0",
  "name": "Mi Nodo Complejo",
  "description": "Un nodo con lógica compleja en archivo separado",
  "group": "Actions",
  "category": "action",
  "shape": "rectangle",
  "color": "#3498DB",
  "icon": "Code2",
  "inputs": [{ "id": "main", "label": "Input", "position": "left" }],
  "outputs": [{ "id": "main", "label": "Output", "position": "right" }],
  "properties": [
    {
      "name": "operation",
      "displayName": "Operation",
      "type": "options",
      "options": [
        { "id": "opt1", "value": "transform", "label": "Transform Data" },
        { "id": "opt2", "value": "validate", "label": "Validate Data" }
      ],
      "default": "transform"
    }
  ],
  "executionFile": true  // ← Indica que el código está en archivo .js separado
}
```

#### Archivo JS de ejecución

El archivo `.js` debe exportar **por defecto** una **función** o un **string** con el código:

**Opción 1: Exportar una función**
```javascript
// my_complex_node.js
export default function(context) {
  const { data, node, $, env, helpers } = context;

  helpers.log('Starting complex node execution');

  const operation = node.properties.operation.value;
  helpers.log(`Operation: ${operation}`);

  // Lógica compleja aquí...
  if (operation === 'transform') {
    helpers.log('Transforming data...');

    const transformed = Object.keys(data).reduce((acc, key) => {
      acc[key.toUpperCase()] = data[key];
      return acc;
    }, {});

    helpers.log(`Transformed ${Object.keys(transformed).length} keys`);
    return transformed;
  }

  if (operation === 'validate') {
    helpers.log('Validating data...');

    const requiredFields = ['id', 'name', 'email'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      helpers.error(`Missing required fields: ${missingFields.join(', ')}`);
      return { valid: false, missingFields };
    }

    helpers.log('Validation passed');
    return { valid: true, data };
  }

  helpers.warn('Unknown operation, returning original data');
  return data;
}
```

**Opción 2: Exportar un string**
```javascript
// my_complex_node.js
export default `
  helpers.log('Starting complex node execution');

  const operation = node.properties.operation.value;
  helpers.log(\`Operation: \${operation}\`);

  // Tu código aquí...

  return { success: true, data };
`;
```

#### Uso en Node Labs

Cuando creas o editas un nodo en **Node Labs**, verás un checkbox **"Generate separated JS file"** en la pestaña de **Code**.

- ✅ **Checkbox activado**: El nodo se guardará con `executionFile: true` y el código en un archivo `.js` separado
- ❌ **Checkbox desactivado** (por defecto): El nodo se guardará con `executionCode` inline en el JSON

#### Ventajas de usar executionFile

1. **Código más limpio**: El JSON de definición es más fácil de leer
2. **Mejor soporte del IDE**: Resaltado de sintaxis completo para JavaScript
3. **Facilita el debugging**: Puedes usar breakpoints y herramientas de desarrollo
4. **Modularidad**: Separa la definición de la lógica
5. **Control de versiones**: Diffs más claros en Git cuando solo cambias la lógica

#### Limitaciones

- Los archivos `.js` no pueden importar módulos externos directamente (solo los ya disponibles en el contexto de Nodify)
- Ambos archivos (JSON y JS) deben estar en la misma carpeta
- El nombre del archivo `.js` debe coincidir **exactamente** con el nombre del archivo `.json`

---

## 4.2. Hooks de Ciclo de Vida del Nodo

Los nodos en Nodify pueden incluir funciones de ciclo de vida (hooks) opcionales que se ejecutan en respuesta a eventos específicos del editor. Estas funciones permiten agregar comportamientos personalizados a los nodos sin modificar el código del editor.

### Hooks Disponibles

*   **`onCreate`**: Se ejecuta cuando el nodo es agregado al canvas por primera vez.
    *   **Casos de uso:** Inicializar configuraciones, registrar el nodo en servicios externos, mostrar notificaciones de bienvenida, configurar valores por defecto dinámicos.
*   **`onUpdate`**: Se ejecuta cuando la configuración del nodo es modificada.
    *   **Casos de uso:** Validar cambios, sincronizar con servicios externos, actualizar dependencias, notificar cambios importantes.
*   **`onMove`**: Se ejecuta cuando el nodo es movido en el canvas.
    *   **Casos de uso:** Guardar la posición en una base de datos, reorganizar relaciones visuales, actualizar layouts automáticos.
*   **`onDelete`**: Se ejecuta cuando el nodo es eliminado del canvas.
    *   **Casos de uso:** Limpiar recursos, dar de baja registros externos, confirmar eliminación, liberar conexiones.

### Contexto Disponible

Cada hook tiene acceso a dos objetos:

*   **`node`**: Objeto con información del nodo:
    ```javascript
    {
      id: string,           // ID único del nodo
      type: string,         // Tipo de nodo
      label: string,        // Etiqueta/nombre del nodo
      config: object,       // Configuración del nodo
      position: {x, y}      // Posición en el canvas
    }
    ```
*   **`helpers`**: Objeto con funciones de ayuda:
    ```javascript
    {
      log: (message, ...args) => void,    // Log normal
      warn: (message, ...args) => void,   // Advertencia
      error: (message, ...args) => void   // Error
    }
    ```

### Ejemplo Completo

Aquí hay un ejemplo de cómo se definen los hooks en el JSON de un nodo:

```json
{
  "id": "example_node",
  "name": "Example Node",
  "category": "action",
  "properties": [
    {
      "name": "apiKey",
      "type": "string",
      "default": ""
    }
  ],
  "onCreate": "helpers.log('Node created!', node.id); helpers.log('Initial config:', node.config);",
  "onUpdate": "helpers.log('Config updated!'); if (node.config.apiKey) { helpers.log('API key is set'); } else { helpers.warn('API key is missing'); }",
  "onMove": "helpers.log('Node moved to position:', node.position);",
  "onDelete": "helpers.warn('Node being deleted:', node.id); helpers.log('Cleaning up resources...');"
}
```

### Ejemplo Real: Chat Trigger

El nodo `chat_trigger` usa el hook `onCreate` para registrar automáticamente el chat en la base de datos:

```json
{
  "id": "chat_trigger",
  "name": "Chat",
  "onCreate": "helpers.log('Chat trigger created with ID:', node.config.chatId); helpers.log('Registering chat in database...'); fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId: node.config.chatId, workflowId: 'auto' }) }).then(() => helpers.log('Chat registered successfully')).catch(err => helpers.error('Failed to register chat:', err));"
}
```

### Buenas Prácticas

*   **✅ Hacer**
    *   Mantener los hooks simples y rápidos.
    *   Usar `helpers.log` para debugging.
    *   Manejar errores de forma elegante.
    *   Documentar el comportamiento de los hooks.
*   **❌ Evitar**
    *   Operaciones muy largas que bloqueen la UI.
    *   Modificar el DOM directamente.
    *   Lanzar excepciones no manejadas.
    *   Depender de variables globales.

### Notas Importantes

1.  **Los hooks son opcionales**: Si un nodo no define un hook, simplemente no se ejecuta nada.
2.  **Ejecución asíncrona**: Los hooks se ejecutan de forma asíncrona y no bloquean el editor.
3.  **No afectan la ejecución del workflow**: Los hooks son para el comportamiento del editor, no del workflow en sí.
4.  **Seguridad**: El código de los hooks se ejecuta en el cliente con `new Function()`, ten cuidado con la seguridad.
5.  **Logs visibles**: Los logs generados por `helpers` aparecen en la consola del navegador con prefijos identificables.

### Limitaciones Actuales

*   Los hooks no pueden acceder directamente al contexto de React.
*   No pueden modificar la configuración del nodo directamente.
*   No tienen acceso a otros nodos del workflow.
*   El código debe ser JavaScript válido en forma de string.

### Futuras Mejoras

*   Soporte para hooks asíncronos con `await`.
*   Acceso a otros nodos y conexiones.
*   Hooks para eventos de conexión (`onConnect`, `onDisconnect`).
*   Hooks para eventos de ejecución del workflow.

---

## 5. Sistema de Slots para Puertos

Nodify utiliza un **sistema de slots** para definir la forma y las posiciones de conexión de los nodos. Este sistema proporciona un control preciso sobre dónde pueden conectarse los puertos de entrada y salida de cada nodo.

### 5.1. Concepto de Slots

Los **slots** son posiciones estáticas y predefinidas en los bordes del nodo donde se pueden colocar puertos de conexión. A diferencia de sistemas donde los puertos se distribuyen automáticamente, en Nodify tú eliges exactamente qué slot usar para cada puerto.

**Características clave:**
- ✅ Slots son **posiciones fijas** que no se mueven
- ✅ Cada slot puede contener **máximo un puerto**
- ✅ Los slots están numerados desde 1 (no desde 0)
- ✅ La cantidad de slots depende de la **forma** del nodo

### 5.2. Formato de Forma: VxH

Las formas de los nodos se definen usando el formato **VxH** (Vertical x Horizontal):

- **V (Vertical)**: Número de slots disponibles en los lados **top** (arriba) y **bottom** (abajo)
- **H (Horizontal)**: Número de slots disponibles en los lados **left** (izquierda) y **right** (derecha)

**Ejemplos:**
- `2x2` = 2 slots arriba/abajo, 2 slots izquierda/derecha (total 8 slots)
- `3x4` = 3 slots arriba/abajo, 4 slots izquierda/derecha (total 14 slots)
- `1x1` = 1 slot en cada lado (total 4 slots)

**Forma especial:**
- `circle` = Equivalente a `1x1` pero con apariencia circular

### 5.3. Formas Disponibles

Nodify soporta formas desde **1x1** hasta **6x6**, más la forma especial **circle**:

```
Formas disponibles:
├─ circle (especial: 1x1 circular)
├─ 1x1, 1x2, 1x3, 1x4, 1x5, 1x6
├─ 2x1, 2x2, 2x3, 2x4, 2x5, 2x6
├─ 3x1, 3x2, 3x3, 3x4, 3x5, 3x6
├─ 4x1, 4x2, 4x3, 4x4, 4x5, 4x6
├─ 5x1, 5x2, 5x3, 5x4, 5x5, 5x6
└─ 6x1, 6x2, 6x3, 6x4, 6x5, 6x6
```

**Máximo:** 6 slots por lado

### 5.4. Numeración de Slots

Los slots se numeran desde **1** (no desde 0) y van de izquierda a derecha o de arriba a abajo:

**Ejemplo de nodo 3x3:**
```
        [slot 1] [slot 2] [slot 3]    ← Top
              ┌─────────────┐
  [slot 1] ───┤             ├─── [slot 1]
  [slot 2] ───┤    NODE     ├─── [slot 2]
  [slot 3] ───┤             ├─── [slot 3]
              └─────────────┘
        [slot 1] [slot 2] [slot 3]    ← Bottom
    Left ↑                         ↑ Right
```

**Importante:** La numeración de slots es **independiente** para cada lado. Cada lado (top, bottom, left, right) tiene su propia secuencia de slots comenzando en 1.

### 5.5. Restricciones de Posición

Los puertos tienen restricciones según su tipo para mantener una convención visual clara:

| Tipo de Puerto | Posiciones Permitidas | Posiciones Prohibidas |
|----------------|----------------------|----------------------|
| **Input** (Entrada) | `left`, `top`, `bottom` | `right` |
| **Output** (Salida) | `right`, `top`, `bottom` | `left` |

**Convención de uso:**
- **Input principal**: Coloca en `left` (entrada de datos del flujo principal)
- **Inputs secundarios**: Coloca en `top` o `bottom` (herramientas, configuración, modelos)
- **Output principal**: Coloca en `right` (salida de datos del flujo principal)
- **Outputs secundarios**: Coloca en `top` o `bottom` (métricas, logs, salidas alternativas)

**Razón:** Este patrón, inspirado en n8n, permite crear nodos flexibles (como AI Agent con múltiples inputs) mientras mantiene la convención visual de flujo izquierda→derecha. Los datos fluyen horizontalmente (left→right) y las conexiones auxiliares usan los ejes verticales (top/bottom).

### 5.6. Asignación Automática de Slots

Cuando creas puertos o cambias la forma del nodo, Nodify puede **asignar automáticamente** los slots usando un algoritmo de distribución equitativa.

#### Algoritmo de Distribución

Los slots se distribuyen **desde los extremos hacia el centro**, creando un espaciado equilibrado:

**Ejemplo 1:** 3 puertos en 6 slots disponibles
```
Slots: [1] [2] [3] [4] [5] [6]
Asignados: ●   ○   ○   ●   ○   ●
           ↑           ↑       ↑
         slot 1     slot 4  slot 6
```

**Ejemplo 2:** 2 puertos en 5 slots disponibles
```
Slots: [1] [2] [3] [4] [5]
Asignados: ●   ○   ○   ○   ●
           ↑               ↑
         slot 1         slot 5
```

**Ejemplo 3:** 1 puerto en 4 slots disponibles
```
Slots: [1] [2] [3] [4]
Asignados: ○   ○   ●   ○
                ↑
              slot 3 (centro)
```

**Reglas especiales:**
- Si hay **1 puerto**: Se coloca en el **centro**
- Si hay **N puertos = N slots**: Se usan **todos los slots**
- Si hay **más puertos que slots**: Se genera un **error de validación**

### 5.7. Interfaz Visual: Grid Selector

Al crear o editar nodos en **Node Labs**, tienes acceso a dos formas de configurar los slots:

#### Modo 1: Lista de Puertos (Manual)
- Dropdown para seleccionar el **slot** de cada puerto
- Los slots ya ocupados aparecen **deshabilitados**
- Incluye campos para ID, Label, Position, Slot y Description

#### Modo 2: Grilla Visual (Visual Grid)
- Representación visual del nodo con todos sus slots
- Selecciona un puerto del dropdown
- Haz clic en un slot de la grilla para asignarlo
- Colores:
  - **Gris**: Slot disponible
  - **Azul**: Slot seleccionado para el puerto actual
  - **Gris oscuro**: Slot ocupado por otro puerto
  - **Transparente**: Posición no permitida para este tipo de puerto

**Leyenda visual:**
```
○ Disponible    ● Seleccionado    ◐ Ocupado    ✕ No permitido
```

### 5.8. Resolución de Conflictos

Cuando cambias la forma de un nodo y esto crea **conflictos de slots** (puertos asignados a slots que ya no existen), Nodify te ofrece 3 opciones:

#### Opción 1: Cancelar
- No se cambia la forma del nodo
- Los puertos mantienen sus slots actuales
- Sin pérdida de datos

#### Opción 2: Auto-ajustar Slots
- Cambia la forma del nodo
- Reasigna automáticamente todos los puertos usando el algoritmo de distribución equitativa
- Los puertos mantienen su posición (left/right/top/bottom) pero cambian de slot

#### Opción 3: Eliminar Puertos Inválidos
- Cambia la forma del nodo
- Elimina los puertos que tienen slots inválidos
- ⚠️ **Advertencia:** Esta acción es irreversible

**Ejemplo de conflicto:**
```
Forma original: 4x4 (4 slots por lado)
Puerto "output1" en position="right", slot=3

Cambio a forma: 2x2 (2 slots por lado)
❌ Conflicto: slot 3 no existe en el lado "right" (solo hay 2 slots)

Opciones:
1. ❌ Cancelar → Mantener forma 4x4
2. ✅ Auto-ajustar → Cambiar a 2x2 y mover "output1" a slot 2
3. ⚠️ Eliminar → Cambiar a 2x2 y eliminar "output1"
```

### 5.9. Validación de Puertos

El sistema valida automáticamente los puertos y muestra errores detallados:

**Validaciones realizadas:**
1. ✅ Slot existe para la posición en la forma actual
2. ✅ Posición permitida para el tipo de puerto (input/output)
3. ✅ No hay duplicados de slots en la misma posición
4. ✅ Slot es un número positivo mayor que 0

**Ejemplo de mensaje de error:**
```
❌ Error de validación:
- Puerto "main" (output): slot 4 es inválido para position "right"
  en forma 2x2 (máximo: 2 slots)
```

### 5.10. Ejemplos Prácticos

#### Ejemplo 1: Nodo Simple de Transformación (2x2)
```json
{
  "shape": "2x2",
  "inputs": [
    {
      "id": "main",
      "label": "Input",
      "position": "left",
      "slot": 1
    }
  ],
  "outputs": [
    {
      "id": "main",
      "label": "Output",
      "position": "right",
      "slot": 1
    }
  ]
}
```

#### Ejemplo 2: Nodo IF con Múltiples Salidas (3x3)
```json
{
  "shape": "3x3",
  "inputs": [
    {
      "id": "main",
      "label": "Input",
      "position": "left",
      "slot": 2,
      "description": "Datos a evaluar"
    }
  ],
  "outputs": [
    {
      "id": "true",
      "label": "True",
      "position": "right",
      "slot": 1,
      "description": "Ejecuta si la condición es verdadera"
    },
    {
      "id": "false",
      "label": "False",
      "position": "right",
      "slot": 3,
      "description": "Ejecuta si la condición es falsa"
    }
  ]
}
```

#### Ejemplo 3: Nodo Webhook Trigger (Circle)
```json
{
  "shape": "circle",
  "inputs": [],
  "outputs": [
    {
      "id": "main",
      "label": "Output",
      "position": "right",
      "slot": 1,
      "description": "Datos del webhook recibido"
    }
  ]
}
```

#### Ejemplo 4: Nodo Merge con Múltiples Entradas (4x3)
```json
{
  "shape": "4x3",
  "inputs": [
    {
      "id": "input1",
      "label": "Stream 1",
      "position": "left",
      "slot": 1
    },
    {
      "id": "input2",
      "label": "Stream 2",
      "position": "left",
      "slot": 2
    },
    {
      "id": "input3",
      "label": "Stream 3",
      "position": "left",
      "slot": 3
    }
  ],
  "outputs": [
    {
      "id": "merged",
      "label": "Merged",
      "position": "right",
      "slot": 2
    }
  ]
}
```

#### Ejemplo 5: Nodo AI Agent con Inputs Secundarios (3x3)
```json
{
  "shape": "3x3",
  "inputs": [
    {
      "id": "main",
      "label": "Input",
      "position": "left",
      "slot": 2,
      "description": "Datos principales del flujo"
    },
    {
      "id": "chat_model",
      "label": "Chat Model",
      "position": "bottom",
      "slot": 1,
      "description": "Modelo de lenguaje a utilizar"
    },
    {
      "id": "memory",
      "label": "Memory",
      "position": "bottom",
      "slot": 2,
      "description": "Sistema de memoria del agente"
    },
    {
      "id": "tools",
      "label": "Tools",
      "position": "bottom",
      "slot": 3,
      "description": "Herramientas disponibles para el agente"
    }
  ],
  "outputs": [
    {
      "id": "main",
      "label": "Output",
      "position": "right",
      "slot": 2,
      "description": "Respuesta del agente"
    }
  ]
}
```

**Visualización del ejemplo 5:**
```
                    [Input principal]
                          ↓
    ┌────────────────────────────────┐
    │                                │
    │         AI Agent               │──→ [Output]
    │                                │
    └────────────────────────────────┘
           ↑        ↑        ↑
      [Model]  [Memory]  [Tools]
    (Inputs secundarios en bottom)
```

### 5.11. Metadata de Puertos

Los puertos soportan campos de metadata opcionales:

```json
{
  "id": "main",
  "label": "Output",
  "position": "right",
  "slot": 1,
  "description": "Descripción detallada del puerto",
  "required": true,
  "metadata": {
    "expectedType": "json",
    "schemaUrl": "https://example.com/schema.json",
    "customField": "cualquier valor"
  }
}
```

**Campos de metadata:**
- `description`: Descripción que aparece en tooltips
- `required`: Si el puerto debe estar conectado
- `metadata`: Objeto libre para datos personalizados

### 5.12. Mejores Prácticas

#### ✅ Hacer:
1. **Usar formas apropiadas para el tipo de nodo:**
   - Triggers: `circle` o `1x1` (1 salida)
   - Transformaciones: `2x2` (1 entrada, 1 salida)
   - Condicionales: `3x3` (1 entrada, 2+ salidas)
   - Merge/Split: `4x3+` (múltiples entradas/salidas)

2. **Distribuir puertos equitativamente:**
   - Usa auto-asignación cuando sea posible
   - Centra salidas únicas visualmente

3. **Agregar descripciones a los puertos:**
   - Ayuda a los usuarios a entender qué conectar
   - Especialmente importante con múltiples puertos

4. **Validar antes de guardar:**
   - Usa el sistema de validación integrado
   - Resuelve errores antes de publicar el nodo

#### ❌ Evitar:
1. **No colocar múltiples puertos en el mismo slot:**
   - Causará errores de validación
   - Confundirá a los usuarios

2. **No usar formas muy grandes sin necesidad:**
   - `6x6` solo si realmente necesitas 36 slots
   - Formas grandes ocupan más espacio en el canvas

3. **No ignorar las restricciones de posición:**
   - Inputs: NUNCA en `right`
   - Outputs: NUNCA en `left`
   - Respeta el flujo horizontal para claridad visual

4. **No cambiar la forma sin revisar conflictos:**
   - Siempre revisa el diálogo de resolución
   - Elige la opción apropiada para tu caso

5. **No abusar de inputs/outputs en top/bottom:**
   - Úsalos para conexiones secundarias/auxiliares
   - El flujo principal debe ir left→right

---

## 6. Sub-Workflows y Flujos Reutilizables

Nodify permite crear múltiples flujos de trabajo dentro del mismo workflow usando los nodos **Node Trigger** y **Call Node Trigger**. Esta funcionalidad es especialmente útil para crear lógica reutilizable y organizar workflows complejos en módulos más pequeños.

### 6.1. Node Trigger

El **Node Trigger** es un tipo especial de trigger que no se activa automáticamente, sino que debe ser llamado explícitamente por otro nodo usando **Call Node Trigger**.

#### Características

- ✅ **Trigger pasivo**: No se ejecuta automáticamente, solo cuando es llamado
- ✅ **Múltiples instancias**: Puedes tener varios Node Triggers en el mismo workflow
- ✅ **Identificación única**: Cada trigger tiene un nombre único para identificarlo
- ✅ **Recibe datos**: Puede recibir datos del nodo que lo llama
- ✅ **Aislado**: Ejecuta su propio sub-flujo de manera independiente

#### Propiedades

- **Trigger Name** (string): Nombre único para identificar este trigger cuando se llama desde otros nodos
- **Description** (string, opcional): Descripción de qué hace este trigger

#### Ejemplo de Uso

```json
{
  "id": "node_trigger",
  "name": "Node Trigger",
  "category": "trigger",
  "properties": [
    {
      "name": "triggerName",
      "displayName": "Trigger Name",
      "type": "string",
      "default": "My Trigger"
    }
  ]
}
```

#### Código de Ejecución

El Node Trigger simplemente pasa los datos que recibió cuando fue llamado:

```javascript
try {
  const triggerName = node.properties.triggerName?.value || 'Unnamed Trigger';

  helpers.log(`Node Trigger '${triggerName}' activated`);
  helpers.log('Received data:', JSON.stringify(data));

  // Pasa los datos recibidos al siguiente nodo
  return data || { triggered: true, triggerName };

} catch (error) {
  helpers.error('Node Trigger failed:', error.message);
  return { error: 'Node Trigger failed', message: error.message };
}
```

### 6.2. Call Node Trigger

El **Call Node Trigger** es un nodo de acción que ejecuta un sub-workflow comenzando desde un Node Trigger específico.

#### Características

- ✅ **Llama triggers**: Inicia la ejecución desde un Node Trigger específico
- ✅ **Selector dinámico**: Lista automáticamente todos los Node Triggers disponibles
- ✅ **Control de datos**: Decide si pasar datos al trigger o empezar con datos vacíos
- ✅ **Sincronía/Asincronía**: Puede esperar el resultado o ejecutar en segundo plano
- ✅ **Retorna resultados**: Devuelve la salida del sub-workflow ejecutado

#### Propiedades

- **Target Node Trigger** (nodeSelector): Selector dinámico que muestra todos los Node Triggers del workflow
- **Pass Input Data** (boolean, default: true): Si está habilitado, pasa los datos de entrada al trigger
- **Wait for Completion** (boolean, default: true): Si está habilitado, espera a que el sub-workflow complete antes de continuar

#### Ejemplo de Uso

```json
{
  "name": "targetNodeId",
  "displayName": "Target Node Trigger",
  "type": "nodeSelector",
  "placeholder": "Select a Node Trigger...",
  "description": "The Node Trigger to execute when this node runs.",
  "typeOptions": {
    "filters": {
      "category": "trigger"
    }
  }
}
```

#### Código de Ejecución

```javascript
try {
  const targetNodeId = node.properties.targetNodeId?.value;
  const passData = node.properties.passData?.value !== false;
  const waitForCompletion = node.properties.waitForCompletion?.value !== false;

  helpers.log(`Calling Node Trigger with ID: ${targetNodeId}`);

  // Preparar datos para el trigger
  const inputData = passData ? data : {};
  helpers.log('Passing data:', JSON.stringify(inputData));

  // Ejecutar el sub-workflow
  if (waitForCompletion) {
    helpers.log('Executing and waiting for completion...');
    const result = await helpers.executeFromNode(targetNodeId, inputData);
    helpers.log('Execution completed. Result:', JSON.stringify(result));
    return result;
  } else {
    helpers.log('Executing without waiting (fire and forget)...');
    helpers.executeFromNode(targetNodeId, inputData).catch(err => {
      helpers.warn('Background execution error:', err.message);
    });
    return { triggered: true, targetNodeId, async: true };
  }

} catch (error) {
  helpers.error('Call Node Trigger failed:', error.message);
  return { error: 'Call Node Trigger failed', message: error.message };
}
```

### 6.3. Helper: executeFromNode

El helper `helpers.executeFromNode()` está disponible en el contexto de ejecución de todos los nodos y permite ejecutar sub-workflows dinámicamente.

#### Sintaxis

```javascript
helpers.executeFromNode(targetNodeId, inputData)
```

#### Parámetros

- **targetNodeId** (string): ID del nodo desde el cual iniciar la ejecución
- **inputData** (any): Datos iniciales para el sub-workflow

#### Retorno

- Promesa que resuelve con el resultado del último nodo ejecutado en el sub-workflow

#### Ejemplo

```javascript
// Ejecutar un Node Trigger específico
const result = await helpers.executeFromNode('node_trigger-123456', {
  userId: '123',
  action: 'process'
});

helpers.log('Sub-workflow completed:', result);
```

### 6.4. Casos de Uso Prácticos

#### Caso 1: Lógica de Procesamiento Reutilizable

```
[Webhook A] → [Call Node Trigger: "Validate User"]
                        ↓
                  [Return Response]

[Webhook B] → [Call Node Trigger: "Validate User"]
                        ↓
                  [Return Response]

[Node Trigger: "Validate User"] → [Check DB] → [Verify Email] → [Return Status]
```

**Beneficio**: La lógica de validación de usuario se escribe una sola vez y se reutiliza en múltiples endpoints.

#### Caso 2: Workflows Modulares

```
[Main Flow] → [Call Node Trigger: "Process Payment"]
                        ↓
              [Call Node Trigger: "Send Email"]
                        ↓
                  [Complete Order]

[Node Trigger: "Process Payment"] → [Charge Card] → [Update DB]
[Node Trigger: "Send Email"] → [Format Template] → [Send via API]
```

**Beneficio**: El workflow principal es más limpio y fácil de entender, con módulos bien definidos.

#### Caso 3: Procesamiento Asíncrono

```
[HTTP Request] → [Call Node Trigger: "Heavy Processing" (async)]
                        ↓
                  [Return Immediate Response]

[Node Trigger: "Heavy Processing"] → [ML Model] → [Save Results] → [Notify User]
```

**Beneficio**: Respuesta rápida al usuario mientras el procesamiento pesado continúa en segundo plano.

#### Caso 4: Flujos Condicionales Complejos

```
[Data Input] → [IF: Type = "A"] → [Call Node Trigger: "Process Type A"]
            ↓
         [ELSE] → [Call Node Trigger: "Process Type B"]

[Node Trigger: "Process Type A"] → [Specific Logic for A]
[Node Trigger: "Process Type B"] → [Specific Logic for B]
```

**Beneficio**: Separación clara de lógicas diferentes según condiciones.

### 6.5. Mejores Prácticas

#### ✅ Hacer:

1. **Nombrar claramente los triggers:**
   - Usa nombres descriptivos: "Process Payment", "Validate User", "Send Notification"
   - Evita nombres genéricos como "Trigger 1", "Flow 2"

2. **Documentar con descripciones:**
   - Usa el campo Description para explicar qué hace el trigger
   - Incluye información sobre qué datos espera recibir

3. **Organizar visualmente:**
   - Agrupa los Node Triggers relacionados en una sección del canvas
   - Usa Group Stickers para separarlos del flujo principal

4. **Manejar errores:**
   - Incluye manejo de errores en los sub-workflows
   - Retorna información de error estructurada

5. **Log adecuado:**
   - Usa helpers.log() para rastrear cuándo se llaman los triggers
   - Log los datos de entrada y salida

#### ❌ Evitar:

1. **No crear recursión infinita:**
   - Un Node Trigger NO debe llamar a Call Node Trigger que lo llame de vuelta
   - Causa bucles infinitos

2. **No depender del orden de ejecución:**
   - Los Node Triggers no se ejecutan en orden específico
   - Solo se ejecutan cuando son llamados

3. **No abusar del modo asíncrono:**
   - Solo usa `waitForCompletion: false` cuando realmente no necesites el resultado
   - Puede dificultar el debugging

4. **No pasar datos sensibles sin validar:**
   - Los datos pasan entre flujos, valida antes de usar
   - Considera la seguridad en sub-workflows

### 6.6. Debugging de Sub-Workflows

Los logs de sub-workflows aparecen en la pestaña Debug con el prefijo `[Sub-workflow]`:

```
12:34:56.789 [LOG]  Calling Node Trigger with ID: node_trigger-123
12:34:56.790 [LOG]  Passing data: {"userId":"123"}
12:34:56.791 [LOG]  [Sub-workflow] Node started: node_trigger-123
12:34:56.792 [LOG]  [Sub-workflow] Node Trigger 'Process Payment' activated
12:34:56.850 [LOG]  [Sub-workflow] Node completed: node_trigger-123 (59ms)
12:34:56.851 [LOG]  Execution completed. Result: {"success":true}
```

**Herramientas de debugging:**
- ✅ Logs jerárquicos para ver flujos anidados
- ✅ Timestamps para medir rendimiento
- ✅ Identificación clara de sub-workflows vs flujo principal

---

## 7. Tipo de Propiedad: nodeSelector

El tipo de propiedad `nodeSelector` permite crear selectores dinámicos que muestran nodos del workflow actual basados en filtros configurables. Es especialmente útil para nodos que necesitan referenciar otros nodos.

### 7.1. Sintaxis Básica

```json
{
  "name": "targetNode",
  "displayName": "Select Node",
  "type": "nodeSelector",
  "placeholder": "Choose a node...",
  "description": "Description of what this selector does",
  "typeOptions": {
    "filters": {
      // Filtros de selección
    }
  }
}
```

### 7.2. Sistema de Filtros

El `nodeSelector` soporta múltiples filtros que se pueden combinar para resultados precisos. Todos los filtros se especifican dentro de `typeOptions.filters`.

#### Filtros Básicos

##### Por Categoría
Filtra nodos por su categoría.

```json
"filters": {
  "category": "trigger"  // Solo muestra triggers
}
```

**Valores válidos**: `trigger`, `action`, `logic`, `data`, `ai`, `other`

##### Por Grupo
Filtra nodos por el grupo al que pertenecen.

```json
"filters": {
  "group": "AI"  // Solo muestra nodos del grupo AI
}
```

**Ejemplos de grupos**: `Triggers`, `Actions`, `AI`, `Data`, `Logic`, `Core`

##### Por Tipo de Nodo
Filtra por el tipo específico de nodo.

```json
"filters": {
  "nodeType": "webhook_trigger"  // Solo webhooks
}
```

##### Por Nombre
Búsqueda parcial en el nombre/label del nodo (case-insensitive).

```json
"filters": {
  "name": "http"  // Encuentra nodos con "http" en su nombre
}
```

##### Por ID
Búsqueda parcial en el ID del nodo.

```json
"filters": {
  "id": "webhook"  // Encuentra nodos con "webhook" en su ID
}
```

#### Filtros de Estado de Conexión

Estos filtros permiten seleccionar nodos basados en si tienen conexiones de entrada o salida.

##### hasInput
Filtra por presencia de conexiones de entrada.

```json
"filters": {
  "hasInput": true   // Solo nodos CON conexiones de entrada
}
```

```json
"filters": {
  "hasInput": false  // Solo nodos SIN conexiones de entrada
}
```

##### hasOutput
Filtra por presencia de conexiones de salida.

```json
"filters": {
  "hasOutput": true   // Solo nodos CON conexiones de salida
}
```

```json
"filters": {
  "hasOutput": false  // Solo nodos SIN conexiones de salida
}
```

##### isConnected
Filtra por presencia de cualquier tipo de conexión.

```json
"filters": {
  "isConnected": true   // Nodos con entrada O salida
}
```

```json
"filters": {
  "isConnected": false  // Nodos sin ninguna conexión
}
```

##### isEmpty
Filtra por ausencia total de conexiones.

```json
"filters": {
  "isEmpty": true   // Nodos sin entrada NI salida
}
```

```json
"filters": {
  "isEmpty": false  // Nodos con al menos una conexión
}
```

### 7.3. Combinación de Filtros

Puedes combinar múltiples filtros para resultados muy específicos. Todos los filtros se aplican con lógica AND (deben cumplirse todos).

#### Ejemplo 1: Triggers sin Usar
```json
{
  "name": "triggerNode",
  "displayName": "Available Trigger",
  "type": "nodeSelector",
  "typeOptions": {
    "filters": {
      "category": "trigger",
      "hasOutput": false
    }
  }
}
```
**Resultado**: Solo triggers que no tienen conexiones de salida (están disponibles).

#### Ejemplo 2: Nodos AI con Entrada
```json
{
  "name": "aiNode",
  "displayName": "Connected AI Node",
  "type": "nodeSelector",
  "typeOptions": {
    "filters": {
      "group": "AI",
      "hasInput": true
    }
  }
}
```
**Resultado**: Solo nodos del grupo AI que ya tienen una conexión de entrada.

#### Ejemplo 3: HTTP Requests Disponibles
```json
{
  "name": "httpNode",
  "displayName": "Available HTTP Node",
  "type": "nodeSelector",
  "typeOptions": {
    "filters": {
      "name": "http",
      "isEmpty": true
    }
  }
}
```
**Resultado**: Solo nodos con "http" en el nombre que no tienen ninguna conexión.

#### Ejemplo 4: Filtros Complejos
```json
{
  "name": "dataSource",
  "displayName": "Data Source Node",
  "type": "nodeSelector",
  "typeOptions": {
    "filters": {
      "category": "action",
      "group": "Data",
      "hasOutput": true,
      "hasInput": false,
      "name": "fetch"
    }
  }
}
```
**Resultado**: Nodos de acción del grupo Data, con "fetch" en el nombre, que tienen salida pero no entrada.

### 7.4. Indicadores Visuales

El `nodeSelector` muestra badges visuales para indicar el estado de conexión de cada nodo:

- **⇄** = Tiene conexiones de entrada Y salida
- **←** = Solo tiene conexiones de entrada
- **→** = Solo tiene conexiones de salida
- (Sin badge) = Sin conexiones

**Ejemplo de visualización:**
```
[Ícono] Webhook Trigger (webhook-1...)     →
[Ícono] HTTP Request (http-req-2...)       ⇄
[Ícono] Code Node (code-3...)              ←
[Ícono] Data Store (data-4...)
```

### 7.5. Mensajes de Alerta

Cuando no hay nodos que cumplan los filtros, el selector muestra un mensaje contextual:

```
❌ No trigger nodes found in this workflow. Add a "Node Trigger" node first.
```

```
❌ No AI nodes found in this workflow.
```

```
❌ No matching nodes found in this workflow. All nodes are currently connected.
```

El mensaje se adapta automáticamente según los filtros activos.

### 7.6. Casos de Uso Prácticos

#### Caso 1: Seleccionar Node Triggers (Call Node Trigger)
```json
{
  "name": "targetNodeId",
  "displayName": "Target Node Trigger",
  "type": "nodeSelector",
  "placeholder": "Select a Node Trigger...",
  "typeOptions": {
    "filters": {
      "category": "trigger"
    }
  }
}
```

#### Caso 2: Seleccionar Nodos Disponibles para Conectar
```json
{
  "name": "nextNode",
  "displayName": "Next Available Node",
  "type": "nodeSelector",
  "placeholder": "Select an available node...",
  "typeOptions": {
    "filters": {
      "hasInput": false,
      "category": "action"
    }
  }
}
```

#### Caso 3: Seleccionar Fuente de Datos
```json
{
  "name": "dataSource",
  "displayName": "Data Source",
  "type": "nodeSelector",
  "placeholder": "Select a data source...",
  "typeOptions": {
    "filters": {
      "hasOutput": true,
      "group": "Data"
    }
  }
}
```

#### Caso 4: Merger Node - Seleccionar Flujos a Unir
```json
{
  "name": "branchNode",
  "displayName": "Branch to Merge",
  "type": "nodeSelector",
  "placeholder": "Select a branch...",
  "typeOptions": {
    "filters": {
      "hasOutput": true,
      "hasInput": true
    }
  }
}
```

#### Caso 5: Loop End - Seleccionar Loop Start
```json
{
  "name": "loopStart",
  "displayName": "Loop Start Node",
  "type": "nodeSelector",
  "placeholder": "Select loop start...",
  "typeOptions": {
    "filters": {
      "nodeType": "loop_start"
    }
  }
}
```

### 7.7. Acceso al Valor Seleccionado

En el `executionCode`, accedes al valor seleccionado como cualquier otra propiedad:

```javascript
const targetNodeId = node.properties.targetNodeId?.value;

if (!targetNodeId) {
  helpers.error('No node selected');
  return { error: 'No node selected' };
}

helpers.log(`Selected node ID: ${targetNodeId}`);

// Usar el ID para ejecutar lógica
const result = await helpers.executeFromNode(targetNodeId, data);
```

### 7.8. Actualización Dinámica

El `nodeSelector` se actualiza automáticamente cuando:
- ✅ Se agregan o eliminan nodos del workflow
- ✅ Se conectan o desconectan nodos
- ✅ Se cambia la categoría o tipo de un nodo
- ✅ Se renombra un nodo

No necesitas recargar el panel de configuración, los cambios se reflejan inmediatamente.

### 7.9. Mejores Prácticas

#### ✅ Hacer:

1. **Usar filtros específicos:**
   - Filtra por categoría cuando sea posible para reducir opciones
   - Combina filtros para resultados precisos

2. **Placeholders descriptivos:**
   - Usa placeholders que indiquen qué tipo de nodo seleccionar
   - Ejemplo: "Select a webhook to trigger..." en vez de "Select node..."

3. **Descripciones claras:**
   - Explica en la descripción qué hace la selección
   - Menciona los requisitos del nodo seleccionado

4. **Validación en código:**
   - Siempre valida que el nodo seleccionado exista
   - Verifica que el nodo sea del tipo esperado

5. **Mensajes de error útiles:**
   - Informa al usuario si no hay nodos disponibles
   - Sugiere qué hacer (ej: "Add a Node Trigger first")

#### ❌ Evitar:

1. **No usar filtros demasiado restrictivos:**
   - Si combinas muchos filtros, puede que nunca haya coincidencias
   - Balancea especificidad con usabilidad

2. **No asumir que hay nodos:**
   - Siempre maneja el caso donde no hay nodos que cumplan los filtros
   - Muestra mensajes de ayuda apropiados

3. **No ignorar el estado de conexión:**
   - Si necesitas un nodo disponible, usa `isEmpty: true` o `hasInput: false`
   - Evita problemas de nodos ya en uso

4. **No hacer filtros confusos:**
   - Evita combinaciones que no tengan sentido lógico
   - Ejemplo: `category: "trigger"` + `hasInput: true` (triggers no tienen input)

### 7.10. Compatibilidad con Node Labs

Cuando creas nodos personalizados en Node Labs, el tipo `nodeSelector` está disponible en el dropdown de tipos de propiedades.

**Configuración en Node Labs:**
1. Agrega una nueva propiedad
2. Selecciona tipo: `nodeSelector`
3. En Type Options, agrega el objeto `filters` en formato JSON:
   ```json
   {
     "filters": {
       "category": "trigger"
     }
   }
   ```

---

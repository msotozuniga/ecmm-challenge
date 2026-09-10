### Instrucciones de ejecución

#### Backend

Abrir una terminal en la carpeta `back`:

```bash
cd back
```

Generar el ambiente virtual `.venv` dentro de `back`:

**Linux/macOS**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Windows (PowerShell)**

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
```

**Windows (cmd)**

```bat
py -m venv .venv
.venv\Scripts\activate.bat
```

Instalar las dependencias, crear el archivo `.env` a partir del template y
crear/actualizar la base de datos de Django:

**Linux/macOS**

```bash
python -m pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
```

**Windows**

```bat
python -m pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
```

Iniciar el backend en el puerto 8000:

```bash
python manage.py runserver
```

Para ejecutar las pruebas del backend:

```bash
python manage.py test
```

#### Frontend

Abrir otra terminal en la carpeta `front`:

```bash
cd front
```

Instalar las dependencias y crear el archivo `.env` a partir del template.

**Linux/macOS**

```bash
npm install
cp .env.example .env
```

**Windows**

```bat
npm install
copy .env.example .env
```

Generar la compilación de producción y luego iniciar la interfaz:

```bash
npm run build
npm run start
```

La interfaz quedará disponible en `http://localhost:3000` y el backend en
`http://127.0.0.1:8000` (o en el puerto alternativo configurado).

### Decisiones y observaciones

#### Backend

##### Decisiones

- Uso de APIViews: Se optó por usar API views para mantener simpleza en URLs y tener alta adapatabilidad respecto a las acciones posibles frente a una request respecto a los Viewsets. También permite el uso de las vistas genericas
- Índice en el nombre de un producto: Se asume que la tabla producto sería de tamaño considerable, por lo que se añade un índice para ayudar búsquedas por tal campo
- 3 décimales en el precio: Según se tiene entendido es el máximo número de decimales que puede usar una moneda

##### Supuestos

- Tabla 'categoría' de bajo tamaño: se asume que la tabla categoría no tendría un gran tamaño, por lo que no se ve necesario usar paginación al momento de enviar al front
- Tabla 'productos' de mediano a alto tamaño: se asume que la tabla producto tendría tamaño considerable, por lo que sería necesario limitarla antes de enviarla al front

##### Mejoras pendientes

- Paginación en productos: si bien la paginación para productos actual es eficiente, si la tabla crece demasiado en tamaño esto podría causar mucho retraso. En ese entonces sería útil cambiar la estrategia de paginación a una basada en índices
- División precio y formato en producto: Un producto puede venir en distintos formatos, y si se quiere vender internacional, sería bueno tener precios diferenciados. Se propone sacar precio de la tabla producto y generar una nueva donde haya una relación entre formato de producto y el precio en alguna moneda

#### Frontend

#### Decisiones

- Reuso modal para creación y actualización de datos producto: los campos y validaciones necesario para ambos procesos son idénticos, por lo que no se veía necesario generar un componente distinto
- Filtros de productos visibles en URL: permite compartir una búsqueda de productos. Útil cuando se quiere redirigir a la página

#### Mejoras pendientes

- Conexión a backend: Para evitar conexión directa contra el backend, el cliente debería mandar una request al servidor de front que actuará como proxy contra el backend.


### Herramientas de IA utilizadas

Se utilizó Github copilot durante el desarrollo. En el contexto del backend, fue usado para la escritura de tests. Por otro lado, para frontend se uso en el diseño de la página y la generación de código, con el postulante dando indicaciones generales sobre la funcionalidad y organización del código.

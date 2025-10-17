# Prueba Técnica Jelou – Monorepo (Customers API + Orders API + Lambda Orchestrator)

Stack:
- Node.js (Express) · JWT · Zod · mysql2
- MySQL 8 · Docker Compose
- Serverless Framework (Node 22) + serverless-offline

> Nota: Las APIs **no** usan `.env` propios. **Solo** existe `.env` en el **root** y otro `.env` en **lambda-orchestrator**.

---

## 1) Requisitos

- Docker + Docker Compose
- Node.js 22.x (para ejecutar la Lambda en local)
- npm 9+

## 2) Levantar MySQL + Customers API + Orders API con Docker
  
  ### 2.1 Crear `.env` en el root del proyecto copiar el contenido de `.env.example`:
  ```
    cp .env.example .env
  ```

  ### 2.2 Ejecutar este comando para levantar la base de datos y las apis:
  ```
    docker compose up -d --build
  ```

  ### 2.3 Verifica que estén levantadas las apis:
  ```
    curl http://localhost:3001/health   # customers-api
    curl http://localhost:3002/health   # orders-api
  ```

  #### Nota:
    - Dentro de Docker, los servicios se comunican por nombre: http://customers-api:3001, http://orders-api:3002.
    - Desde tu máquina (host), usas http://localhost:3001 y http://localhost:3002.

## 3) Levanta la lambda-orchestrator

  ### 3.1 Crear `.env` en el root del folder `/lambda-orchestrator`  y copiar el contenido de `.env.example`:
  ```
    cp .env.example .env
  ```

  ### 3.2 Instala las dependencias requeridas:

  Ejecuta este comando para instalar la dependencias:
    ```
      npm install
    ```

  ### 3.3 Generar `JWT_TOKEN`:  ```

  Para poder hacer requests desde nuestra lambda a las apis, tenemos que firmar un secreto (ten en cuenta que debe ser el valor de la valriable `SERVICE_TOKEN` en este caso es super-secret), 
  para esto, ejecuta el siguiente comando, luego usa ese token en la variable de entorno `JWT_TOKEN` de la lambda:
  ```
    node -e "console.log(require('jsonwebtoken').sign({ sub: 1, role: 'admin' }, 'super-secret', { expiresIn: '1h' }))"
  ```

  ### 3.4 Ejecutar la lambda en local:

  Solo debes ejecutar el siguiente comando para ejecutar la lambda en local:
  ```
    npx serverless offline
  ```

## Prueba el funcionamiento de la lambda-orchestrator:

  -  La lambda se estará ejecutando en este endpoint: http://localhost:3000/orchestrator/create-and-confirm-order
  - Para probarla, copia y pega este comando curl:
  ```
    curl -X POST http://localhost:3000/orchestrator/create-and-confirm-order \
      -H "Content-Type: application/json" \
      -d '{"customer_id":1,"items":[{"product_id":1,"qty":2}],"idempotency_key":"abc-123","correlation_id":"req-789"}'
  ```

## Probar las apis con Postman:
  En el repo incluyo una colección (customers_orders_postman_collection.json) que podés Importar en Postman para poder probar las apis de manera rapida. 
  No olvides de poner el JWT_TOKEN que generes, ya que por lo general la firma tiene una caducación de una hora. 
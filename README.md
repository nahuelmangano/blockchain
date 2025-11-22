# INSTRUCCIONES #
(npm install hardhat)
1. npx hardhat compile
2. npx hardhat run scripts/deploy.js --network sepolia
3. copiar direccion del contrato al .env
4. node server.js

# CURL DE PRUEBA #
curl -X POST http://localhost:3000/notarize ^
  -H "Content-Type: multipart/form-data" ^
  -F "file=@C:\Util\nomi1.pdf"



  # Ver contrato#
  https://sepolia.etherscan.io/address/TU_CONTRACT_ADDRESS

  # Ver movimiento poner el txtHash en el buscador #
  https://sepolia.etherscan.io/

  # Ver bloque#

  https://sepolia.etherscan.io/block/"nrobloque"
  
  

## Ejecutar con Docker

Se proporciona un `Dockerfile` y `docker-compose.yml` para ejecutar la aplicación en contenedores.

1) Construir imagen (desde la raíz del repo):

```sh
docker build -t notary-upe:latest .
```

2) Ejecutar el contenedor (usa variables desde `.env`):

```sh
docker run --rm -p 3000:3000 --env-file .env -v "$(pwd)/uploads:/usr/src/app/uploads" notary-upe:latest
```

3) Alternativa con docker-compose (más simple):

```sh
docker-compose up --build -d
```

Notas:
- Asegúrate de tener un archivo `.env` con `RPC_URL`, `PRIVATE_KEY` y `CONTRACT_ADDRESS` antes de ejecutar el contenedor.
- El volumen `./uploads` se monta en el contenedor para persistir los archivos subidos.


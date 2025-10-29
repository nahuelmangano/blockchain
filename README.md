# INSTRUCCIONES #

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
  
  
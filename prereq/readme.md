create ceartificate:
rootsca:
openssl req -x509 -sha256 -days 3650 -newkey rsa:4096 -keyout rootCA.key -out rootCA.crt

keycloack certificate:
openssl req -new -newkey rsa:4096 -keyout localhost.key -out localhost.csr -nodes

Sign host csr with rootCA (see below for file localhost.ext):
openssl x509 -req -CA rootCA.crt -CAkey rootCA.key -in localhost.csr -out localhost.crt -days 365 -CAcreateserial -extfile localhost.ext


client certificate:
openssl req -new -newkey rsa:4096 -nodes -keyout fredFlintstone.key -out fredFlintstone.csr

Sign client csr with rootCA:
openssl x509 -req -CA rootCA.crt -CAkey rootCA.key -in fredFlintstone.csr -out fredFlintstone.crt -days 365 -CAcreateserial

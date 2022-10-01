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


run keycloak
sudo docker run --name myKeyCloak -p 8089:8080 -p 8443:8443 -v /home/shlomo/cert/server/localhost.crt:/etc/x509/https/tls.crt -v /home/shlomo/cert/server/localhost.key:/etc/x509/https/tls.key -v /home/shlomo/cert/ca/rootCA.crt:/etc/x509/https/rootCA.crt -e X509_CA_BUNDLE=/etc/x509/https/rootCA.crt -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -d jboss/keycloak:15.1.0


from keycloalk main menu import the test relm from json file: relem-export.json

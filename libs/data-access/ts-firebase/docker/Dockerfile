FROM node:22-bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jre-headless curl ca-certificates && \
    npm install -g firebase-tools@13.29.1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /srv/firebase

COPY firebase.json .firebaserc firestore.rules firestore.indexes.json storage.rules database.rules.json ./

EXPOSE 4000 8080 9000 9099 9199

CMD ["firebase", "emulators:start", "--project", "demo-mono-magic", "--only", "auth,firestore,database,storage"]

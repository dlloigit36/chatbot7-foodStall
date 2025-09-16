# This is a folder to run "api", "web", and "web-agent" as docker container
1. build "api-fs" docker image locally
```
agu88@MSI MINGW64 /c/01-web-dev/project-chatbot7-foodstall/api-fs (main)
$ docker build -t cb7-fs-api:1.0.0 -f api-h.dockerfile .
```

2. build "web-fs" docker image locally.
```
agu88@MSI MINGW64 /c/01-web-dev/project-chatbot7-foodstall/web-fs (main)
$ docker build -t cb7-fs-web:1.0.0 -f web-h.dockerfile .
```

3. build "web-fs-agent" docker image locally.
```
agu88@MSI MINGW64 /c/01-web-dev/project-chatbot7-foodstall/web-fs-agent (main)
$ docker build -t cb7-fs-web-agent:1.0.0 -f web-agent.dockerfile .
```

4. run postgres, "api", "web", and "web-agent" as docker container in docker compose file (cb-foodstall-docker-compose.yml)
- Notes: create a directory named "db-data" locally to preserve postgres DB file.
```
agu88@MSI MINGW64 /c/01-web-dev/project-chatbot7-foodstall/run-as-docker (main)
$ docker-compose -f cb-foodstall-docker-compose.yml up -d
```

pipeline {

    agent {
        label 'docker_agent'
    }

    tools {
        nodejs 'Node 22'
    }

    options {
        disableConcurrentBuilds(abortPrevious: true)
        skipDefaultCheckout(true)
    }

    environment {
        IMAGE_NAME = 'hello-express'
        CONTAINER_NAME = 'hello-express'
        HOST_PORT = '3000'
        CONTAINER_PORT = '3000'
        TESTS_PASSED = 'false'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Deploy') {
            stages {
                stage('Prepare image tag') {
                    steps {
                        script {
                            env.IMAGE_TAG = sh(
                                script: 'git rev-parse HEAD',
                                returnStdout: true
                            ).trim()
                        }
                    }
                }

                stage('Build Docker image locally') {
                    steps {
                        sh '''\
                            |#!/usr/bin/env bash
                            |set -euo pipefail
                            |
                            |docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
                            |'''.stripMargin()
                    }
                }

                stage('Stop and delete existing container') {
                    steps {
                        sh '''\
                            |#!/usr/bin/env bash
                            |set -euo pipefail
                            |
                            |if docker ps -a --format '{{.Names}}' | grep -Fxq "${CONTAINER_NAME}"; then
                            |    docker rm -f "${CONTAINER_NAME}"
                            |else
                            |    echo "Container ${CONTAINER_NAME} does not exist. Skipping."
                            |fi
                            |'''.stripMargin()
                    }
                }

                stage('Start new container') {
                    steps {
                        sh '''\
                            |#!/usr/bin/env bash
                            |set -euo pipefail
                            |
                            |docker_args=(
                            |    -d
                            |    --name "${CONTAINER_NAME}"
                            |    --restart unless-stopped
                            |    -p "${HOST_PORT}:${CONTAINER_PORT}"
                            |    "${IMAGE_NAME}:${IMAGE_TAG}"
                            |)
                            |
                            |docker run "${docker_args[@]}"
                            |'''.stripMargin()
                    }
                }

                stage('Verify deployment') {
                    steps {
                        sh '''\
                            |#!/usr/bin/env bash
                            |set -euo pipefail
                            |
                            |for attempt in {1..10}; do
                            |    status="$(curl -sS -o /dev/null -w '%{http_code}' "http://localhost:${HOST_PORT}/" || true)"
                            |
                            |    if [ "${status}" = "200" ]; then
                            |        echo "Deployment verified."
                            |        exit 0
                            |    fi
                            |
                            |    echo "Attempt ${attempt} failed with status ${status}."
                            |    sleep 2
                            |done
                            |
                            |echo "Deployment did not return a successful status code."
                            |docker logs "${CONTAINER_NAME}" || true
                            |exit 1
                            |'''.stripMargin()
                    }
                }

                stage('Tag successful local image') {
                    steps {
                        sh '''\
                            |#!/usr/bin/env bash
                            |set -euo pipefail
                            |
                            |docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${IMAGE_NAME}:latest"
                            |'''.stripMargin()
                    }
                }
            }
        }
    }
}

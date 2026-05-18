pipeline {
    agent {
        label 'docker_agent'
    }

    stages {
        stage('Test Docker') {
            steps {
                sh 'docker version'
                sh 'docker ps'
            }
        }
    }
}

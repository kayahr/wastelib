pipeline {
  agent any
  stages {
    stage('Initialize') {
      steps {
        parallel(
          "Initialize": {
            echo 'Test'
            
          },
          "sdkjhskdf": {
            sh 'npm --version'
            
          }
        )
      }
    }
  }
}
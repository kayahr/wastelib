pipeline {
  agent {
    node {
      label 'master'
    }
    
  }
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
pipeline {
  agent {
    node {
      label 'bender'
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
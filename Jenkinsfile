pipeline {
    agent any
	environment {
        JENKINS_NODE_COOKIE='dontKillMe'
    }
	stages {
		stage('build') {
			steps {
				sh 'echo "running build in temp workspace"'
				configFileProvider([configFile(fileId: '512614b8-8b30-448f-80f5-dd2ef3d0d24d', targetLocation: 'config.ts')]) {}
				sh 'npm run clean'
				sh 'npm i'
				sh 'npm run build'
			}
		}
		stage('test') {
			steps {
				sh 'echo "testing in temp workspace..."'
				sh 'npm run test'
			}
		}
		stage('deploy') {
			steps {
				script {
					if(env.BRANCH_NAME == 'main') {
						sh 'echo "rebuilding and deploying in prod directory..."'
						sh 'cd /usr/local/sage/SageV2 && git pull && npm run clean && npm i && npm run build'
					} else {
						echo 'build done, branch OK'
					}
				}
			}
		}
	}
	post {
		always {
            discordSend(
				description: "Build " + currentBuild.currentResult + " on branch [" + env.BRANCH_NAME + 
				"](https://github.com/ud-cis-discord/SageV2/commit/" + env.GIT_COMMIT + ")", 
				footer: env.BUILD_TAG,
				link: env.BUILD_URL, 
				result: currentBuild.currentResult, 
				title: JOB_NAME, 
				webhookURL: env.DISCORD_WEBHOOK
			)
        }
	}
}

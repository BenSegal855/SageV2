def boolean stage_results = false
pipeline {
    agent any
	environment {
        JENKINS_NODE_COOKIE='dontKillMe'
		DISCORD_WEBHOOK=credentials('3fbb794c-1c40-4471-9eee-d147d4506046')
    }
	stages {
		stage('Test Build') {
			steps {
				catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
					sh 'echo "running build in temp workspace"'
					configFileProvider([configFile(fileId: '512614b8-8b30-448f-80f5-dd2ef3d0d24d', targetLocation: 'config.ts')]) {}
					sh 'npm run clean'
					sh 'npm i'
					sh 'npm run build'
					script{ stage_results = true }
				}
				script { 
					discordSend(
						description: "Test build " + currentBuild.currentResult + " on branch [" + env.BRANCH_NAME + 
						"](https://github.com/ud-cis-discord/SageV2/commit/" + env.GIT_COMMIT + ")", 
						footer: env.BUILD_TAG,
						link: env.BUILD_URL, 
						result: currentBuild.currentResult, 
						title: JOB_NAME + " -- Test Build", 
						webhookURL: env.DISCORD_WEBHOOK
					)
					if (stage_results == false) {
						sh 'exit 1'
					}
					stage_results = false
				}
				
			}
		}
		stage('Lint') {
			steps {
				catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
					sh 'echo "testing in temp workspace..."'
					sh 'npm run test'
					script{ stage_results = true }
				}
				script { 
					discordSend(
						description: "Lint " + currentBuild.currentResult + " on branch [" + env.BRANCH_NAME + 
						"](https://github.com/ud-cis-discord/SageV2/commit/" + env.GIT_COMMIT + ")", 
						footer: env.BUILD_TAG,
						link: env.BUILD_URL, 
						result: currentBuild.currentResult, 
						title: JOB_NAME + " -- Lint", 
						webhookURL: env.DISCORD_WEBHOOK
					)
					if (stage_results == false) {
						sh 'exit 1'
					}
					stage_results = false
				}
			}
		}
		stage('Deploy') {
			steps {
				catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
					script {
						if(env.BRANCH_NAME == 'jenkinsHook') {
							sh 'echo "rebuilding and deploying in prod directory..."'
							sh 'cd /usr/local/sage/fakeDir && git pull && npm run clean && npm i && npm run build'
						} else {
							echo 'build done, branch OK'
						}
						stage_results = true
					}
				}
				script { 
					def discord_desc = "Deploy " + currentBuild.currentResult + " on branch [" + env.BRANCH_NAME + "](https://github.com/ud-cis-discord/SageV2/commit/" + env.GIT_COMMIT + ")"
					if(stage_results == false && env.BRANCH_NAME == 'jenkinsHook') {
						discord_desc = "URGENT!! -- " + discord_desc
					}
					discordSend(
						description: discord_desc, 
						footer: env.BUILD_TAG,
						link: env.BUILD_URL, 
						result: currentBuild.currentResult, 
						title: JOB_NAME + " -- Lint", 
						webhookURL: env.DISCORD_WEBHOOK
					)
					if (stage_results == false) {
						sh 'exit 1'
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

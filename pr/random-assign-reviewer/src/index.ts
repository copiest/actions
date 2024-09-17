import * as core from '@actions/core'
import * as github from '@actions/github'

async function main() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const ORGANIZATION_NAME = core.getInput('ORGANIZATION_NAME')
    // const ASSIGN_COUNT = core.getInput('ASSIGN_COUNT')

    // Organization의 멤버 리스트 가져오기
    const members = await octokit.rest.orgs.listMembers({
        org: ORGANIZATION_NAME,
    })

    console.log(members.data) // eslint-disable-line
}

main()

import * as core from '@actions/core'
import * as github from '@actions/github'

async function getAllRepos() {
    const result = [] as {owner: string; name: string}[]
    let page = 1

    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const ORGANIZATION_NAME = core.getInput('ORGANIZATION_NAME')

    while (true) {
        // ORGANIZATION_NAME 이 있다면 조직이 관리하는 레포를 모두 가져옵니다.
        // ORGANIZATION_NAME 값이 없다면 유저의 모든 레포를 가져옵니다.
        const repos = await octokit.rest.repos.listForOrg({
            org: ORGANIZATION_NAME,
            per_page: 100,
            page,
        })

        if (repos.data.length === 0) {
            break
        }

        result.push(
            ...repos.data.map(({owner, name}) => ({
                owner: owner.login,
                name,
            })),
        )

        page++
    }

    return result
}

export default getAllRepos

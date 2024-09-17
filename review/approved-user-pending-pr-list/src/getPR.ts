import * as core from '@actions/core'
import * as github from '@actions/github'

async function getPR(repos: {owner: string; name: string}[], userName: string) {
    const result = []

    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    for (const repo of repos) {
        // 대기 중인 PR 목록 가져오기
        const pulls = await octokit.rest.pulls.list({
            owner: repo.owner,
            repo: repo.name,
            state: 'open',
        })

        const 승인한유저의PR = pulls.data.filter((pr) => pr.user.login === userName)

        result.push(...승인한유저의PR.map(({title, html_url, number}) => ({title, html_url, number})))
    }

    return result
}

export default getPR

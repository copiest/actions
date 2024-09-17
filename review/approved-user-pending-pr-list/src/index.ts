import * as core from '@actions/core'
import getAllRepos from 'getAllRepos'
import getApproveUserInfo from 'getApproveUserInfo'
import getPR from 'getPR'

async function main() {
    const 승인한유저 = await getApproveUserInfo()

    // 조직의 모든 레포를 가져온다.
    const repos = await getAllRepos()

    // 승인한유저가 대기하고있는 PR 목록을 가져온다.
    const PR = await getPR(repos, 승인한유저)

    core.setOutput('approver_info', JSON.stringify(승인한유저))
    core.setOutput('approver_pr_list', JSON.stringify(PR))
}

main()

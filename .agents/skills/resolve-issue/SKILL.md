# Resolve GitHub Issue

## Description

GitHubの特定Issueを確認し、自動でブランチ作成・コード実装・コミット・Issueクローズまでを行います。

## Instructions

1. 指定されたGitHub Issueの番号から、内容と要件を把握してください。
2. `issue-[番号]` という名前で新しくGitブランチを作成してください。
3. Planning modeに切り替え、実装計画（Implementation Plan）を作成してユーザーの承認を得てください。
4. 承認後、コードを実装し、ローカルで動作検証を行ってください。ただし、UI実装を伴う場合にはスクリーンショットを撮り、ユーザーの承認を得てください。
5. 実装が完了したら変更をコミットし、対応するIssueを自動でクローズしてください。

## Requirements

- GitHubリポジトリへのプッシュ権限
- GitHub Personal Access Token（PAT）の適切な設定
- Issue番号が正しく指定されていること

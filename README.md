# Addon Packager Proxy

This is a tool designed to help authors of "addons" for the popular MMORPG "World of Warcraft" release their projects to both [Curse/CurseForge](http://www.curseforge.com/) and [WowInterface](http://wowinterface.com/community.php), the two most popular sites for hosting releases for such projects.

It fits to a very specific release schedule, and it has some requirements:

- The user needs to use [Git](http://www.git-scm.com/).
- The user needs to push to both GitHub and CurseForge repositories.
- Support for automatic changelogs is pretty bare, and requires them to be handled in several ways.
	- For one, the changelog has to be written in Markdown, following a very specific set of rules.

## How it works

This application is utilizing [GitHub webhooks](https://developer.github.com/webhooks/), [CurseForge's packager](http://www.curseforge.com/wiki/projects/packaging-an-addon/) and a web server.

1. The user commits his changes locally and creates tags, the tags are used as version numbers.
2. The user pushes the commit(s) and tag(s) to GitHub.
3. GitHub recognizes the tag(s) created, sends off a webhook to the application.
4. The application notices the webhook and the repository and starts querying CurseForge for any updates.
5. The user pushes the commit(s) and tag(s) to CurseForge.
6. The application then grabs the packaged addon off CurseForge once it's ready.
7. The application authorizes and uploads the addon to WowInterface.

## How to use

Click the purple button below and follow the instructions on the screen.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Legal

See [LICENSE.txt](https://github.com/p3lim/addon-packager-proxy).

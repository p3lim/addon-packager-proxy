module.exports = {
	// GitHub Webhook
	'WEBHOOK_NO_DELIVERY': 'No delivery ID.',
	'WEBHOOK_NO_SECRET': 'No secret.',
	'WEBHOOK_NO_EVENT': 'No event.',
	'WEBHOOK_SIGN_MISMATCH': 'Signatures did not match.',
	'WEBHOOK_SYNTAX_ERROR': 'Payload contained syntax errors.',
	'WEBHOOK_PING_MESSAGE': 'Ping: %s',
	'WEBHOOK_EVENT_MISMATCH': 'Invalid event "%s".',
	'WEBHOOK_REF_MISMATCH': 'Invalid ref "%s".',
	'WEBHOOK_REPO_MISMATCH': 'Repository "%s" is not tracked.',
	'WEBHOOK_RECEIVED_MESSAGE': 'Received event for "%s" version "%s".',

	// Gist
	'GIST_NOT_FOUND': 'Could not find gist "%s".',
	'GIST_FILE_NOT_FOUND': 'Could not find "addons.json" file in gist.',
	'GIST_SYNTAX_ERROR': 'Gist contained a syntax error.',
	'GIST_SUCCESSFUL': 'Successfully fetched addon list.',

	// App
	'LOOP_EXCEEDED_ATTEMPTS': 'Failed to query CurseForge after %s attempts.',
	'LOOP_ATTEMPT': 'Attempt #%s at querying CurseForge.',
	'RESPONSE_INCORRECT': '"%s" responded with code %s.',
	'FORCED_CHECK_MESSAGE': 'Received forced check for "%s" version "%s".',
	'WORK_ORDER_STARTED': 'Work order #%s started',
	'CHANGELOG_MISSING': 'Changelog file at path "%s" is missing.',

	// CurseForge-specific
	'CURSE_TAG_FOUND': 'Found tag link on CurseForge.',
	'CURSE_TAG_NOT_FOUND': 'Could not find tag link on CurseForge.',
	'CURSE_FILE_FOUND': 'Found file link on CurseForge.',
	'CURSE_FILE_NOT_FOUND': 'Could not find file link on CurseForge.',
	'CURSE_FILE_DOWNLOADED': 'Successfully downloaded file from CurseForge.',

	// WowInterface-specific
	'AUTH_SUCCESSFUL': 'Successfully authenticated with WowInterface.',
	'ADDON_DETAILS': 'Found existing addon, previous version: "%s".',
	'ADDON_EXISTS': 'Addon with version "%s" already exist.',
	'ADDON_UPLOADED': 'Addon "%s" version "%s" was successfully uploaded.',

	// Misc
	'CONNECTION_ERROR': 'Failed to connect to "%s".',
	'ERROR_MESSAGE': '%s: %s',
	'SIGN_PROVIDED': 'Signature provided: %s',
	'SIGN_COMPUTED': 'Signature computed: %s',
	'CLONE_ERROR': 'Cloning failed with status %s.',
}

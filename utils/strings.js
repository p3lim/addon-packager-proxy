module.exports = {
	// GitHub Webhook
	'WEBHOOK_NO_DELIVERY': 'No delivery ID.',
	'WEBHOOK_NO_SECRET': 'No secret.',
	'WEBHOOK_NO_EVENT': 'No event.',
	'WEBHOOK_SIGN_MISMATCH': 'Signatures did not match.',
	'WEBHOOK_SYNTAX_ERROR': 'Payload contained syntax errors.',
	'WEBHOOK_PING_MESSAGE': 'Ping: %s',
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
	'RESPONSE_INCORRECT': '"%s" responded with code %s: "%s"',
	'FORCED_CHECK_MESSAGE': 'Received forced check for "%s" version "%s".',
	'FORCED_GIST_UPDATE_MESSAGE': 'Received forced update of addon list.',
	'WORK_ORDER_STARTED': 'Work order #%s started',
	'CHANGELOG_MISSING': 'Changelog file at path "%s" is missing.',
	'CHANGELOG_FETCH': 'Attempting to fetch changelog from path "%s".',
	'CHANGELOG_FETCHED': 'Changelog fetched successfully from path "%s".',
	'TOC_MISSING': 'Toc file is missing.',
	'INTERFACE_VERSION_MISSING': 'Toc file does not contain an Interface version.',

	// CurseForge-specific
	'CURSE_ATTEMPT': 'Attempting to find file on CurseForge.',
	'CURSE_FAIL': 'Failed to find file on CurseForge.',
	'CURSE_TAG_FOUND': 'Found tag link on CurseForge.',
	'CURSE_TAG_NOT_FOUND': 'Could not find tag link on CurseForge.',

	// WowAce-specific
	'WOWACE_ATTEMPT': 'Attempting to find file on WowAce.',
	'WOWACE_FAIL': 'Failed to find file on WowAce.',
	'WOWACE_TAG_FOUND': 'Found tag link on WowAce.',
	'WOWACE_TAG_NOT_FOUND': 'Could not find tag link on WowAce.',

	// Curse-network-specific
	'CURSE_FILE_ATTEMPT': 'Attempting to download file.',
	'CURSE_FILE_DOWNLOADED': 'Successfully downloaded file.',

	// WowInterface-specific
	'ADDON_DETAILS': 'Found existing addon, previous version: "%s".',
	'ADDON_EXISTS': 'Addon with version "%s" already exist.',
	'ADDON_UPLOADING': 'Attempting to upload addon to WowInterface.',
	'ADDON_UPLOADED': 'Addon "%s" version "%s" was successfully uploaded.',
	'COMPATIBLE_FETCHED': 'Compatibility list sucessfully fetched.',
	'COMPATIBLE_DEFAULT': 'Found no compatible id for "%s", defaulting to "%s".',
	'COMPATIBLE': 'Found compatible id "%s" for "%s".',

	// Misc
	'CONNECTION_ERROR': 'Failed to connect to "%s".',
	'ERROR_MESSAGE': '%s: %s',
	'SIGN_PROVIDED': 'Signature provided: %s',
	'SIGN_COMPUTED': 'Signature computed: %s',
	'FETCH_ERROR': 'Fetching failed with status %s.',
	'MERGE_ERROR': 'Merging failed with status %s.',
	'CLONE_ERROR': 'Cloning failed with status %s.',
}

module.exports = {	
	deleteNotificationUser : `
		DELETE
		FROM notificationuser
		WHERE notificationtype IN (
			SELECT id
			FROM notificationtype
			WHERE service = ?
		)`,
	
	deleteNotificationType : `
		DELETE
		FROM notificationtype
		WHERE service = ?`
};
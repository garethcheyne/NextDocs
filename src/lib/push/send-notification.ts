/**
 * Send push notification to users
 * Use this from server-side code or API routes
 */
export async function sendPushNotification(options: {
  title: string
  body: string
  url?: string
  userIds?: string[]
}) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      throw new Error('Failed to send push notification')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error sending push notification:', error)
    throw error
  }
}

// Example usage:
// await sendPushNotification({
//   title: 'New Document Published',
//   body: 'Check out the latest API documentation',
//   url: '/guide/api-docs',
//   userIds: ['user1', 'user2'] // optional, send to specific users
// })

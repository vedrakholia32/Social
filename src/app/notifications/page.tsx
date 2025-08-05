"use client"
import { getNotifications, markNotificationsAsRead } from '@/actions/notification.action'
import { NotificationsSkeleton } from '@/components/NotificationSkeleton'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from "date-fns";

type Notifications = Awaited<ReturnType<typeof getNotifications>>
type Notification = Notifications[number]

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true)
            try {
                const data = await getNotifications();
                setNotifications(data)

                const unreadIds = data.filter(n => !n.read).map(n => n.id);
                if (unreadIds.length > 0) await markNotificationsAsRead(unreadIds);

            } catch (error) {
                console.error("Error fetching notifications:", error);
                toast.error("Failed to fetch notifications")
            } finally {
                setIsLoading(false)
            }
        }
        fetchNotifications()
    }, [])

    if (isLoading) return <NotificationsSkeleton />

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Notifications</h1>

            {notifications.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="p-4 border rounded-lg bg-card"
                        >
                            <div className="flex items-start space-x-3">
                                {notification.creator?.image && (
                                    <img
                                        src={notification.creator.image}
                                        alt={notification.creator.name || "User"}
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-semibold">
                                            {notification.creator?.name || "Someone"}
                                        </span>
                                        {notification.type === "FOLLOW" && " started following you"}
                                        {notification.type === "LIKE" && " liked your post"}
                                        {notification.type === "COMMENT" && " commented on your post"}
                                    </p>
                                    <p className="text-sm text-muted-foreground pl-4">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

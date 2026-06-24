// apps/web/src/features/settings/SettingsPage.tsx
"use client"

import { useState } from "react"

import { useMyProfile, useUpdateMyProfile } from "./queries"

export function SettingsPage() {
  const { data: profile, isLoading } = useMyProfile()
  const { mutate: updateProfile, isPending } = useUpdateMyProfile()

  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [usernameError, setUsernameError] = useState("")

  if (profile && username === "" && displayName === "" && bio === "") {
    setUsername(profile.username)
    setDisplayName(profile.display_name ?? "")
    setBio(profile.bio ?? "")
  }

  const handleUpdateProfile = () => {
    setUsernameError("")
    updateProfile(
      { username, display_name: displayName || null, bio: bio || null },
      {
        onError: (error) => {
          if (error.message.includes("already taken")) {
            setUsernameError("This username is already taken")
          }
        },
      }
    )
  }

  const handleTogglePublicSharing = () => {
    if (!profile) return
    updateProfile({ is_profile_public: !profile.is_profile_public })
  }

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!profile) return null

  return (
    <div className="mx-auto max-w-xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Profile */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Profile</h2>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Username</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
          <p className="text-xs text-gray-400">Your public profile will be /u/{username}</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Display name</label>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Bio</label>
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
          onClick={handleUpdateProfile}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </section>

      {/* Sharing */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Sharing</h2>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Public profile</p>
            <p className="text-xs text-gray-500">
              {profile.is_profile_public
                ? `Anyone can view your profile, favorites, and activity at /u/${profile.username}`
                : "Only people you allow to follow can view your profile"}
            </p>
          </div>
          <button
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              profile.is_profile_public ? "bg-blue-500" : "bg-gray-300"
            }`}
            onClick={handleTogglePublicSharing}
            disabled={isPending}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                profile.is_profile_public ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  )
}

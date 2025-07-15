'use client'

import { createEvent } from '@/server/actions/events'

export function CreateEventForm() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Create New Event</h2>

      <form action={createEvent} className="space-y-4 bg-white border rounded-lg p-6 shadow-sm">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Event title"
          />
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
            Subtitle
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Event subtitle"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Event description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date *
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date *
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              required
              className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="locationType" className="block text-sm font-medium text-gray-700">
            Location Type *
          </label>
          <select
            id="locationType"
            name="locationType"
            required
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select location type</option>
            <option value="PHYSICAL">Physical</option>
            <option value="ONLINE">Online</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <div>
          <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
            Venue Name
          </label>
          <input
            type="text"
            id="venueName"
            name="venueName"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Venue name"
          />
        </div>

        <div>
          <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">
            Venue Address
          </label>
          <input
            type="text"
            id="venueAddress"
            name="venueAddress"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Full address"
          />
        </div>

        <div>
          <label htmlFor="onlineUrl" className="block text-sm font-medium text-gray-700">
            Online URL
          </label>
          <input
            type="url"
            id="onlineUrl"
            name="onlineUrl"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://zoom.us/..."
          />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Maximum attendees"
          />
        </div>

        <input type="hidden" name="timezone" value="UTC" />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Event
        </button>
      </form>
    </div>
  )
}

import React from 'react'
import Link from 'next/link'
import { Payload } from 'payload'

export const DashboardView = () => {
    return (
        <div className="custom-dashboard">
            <div className="custom-dashboard-header">
                <h1>WhatTheyHold Admin</h1>
                <p style={{ color: 'var(--theme-text-dim)' }}>
                    Manage data, legal pages, and analytics for the platform.
                </p>
            </div>

            <div className="custom-dashboard-grid">
                {/* Custom cards for each collection/page */}
                <div className="custom-card">
                    <h3>Analytics</h3>
                    <p>View visitor stats, trending funds, and general site activity.</p>
                    <Link href="/admin/analytics" className="custom-card-action">
                        View Analytics &rarr;
                    </Link>
                </div>

                <div className="custom-card">
                    <h3>Admin Users</h3>
                    <p>Manage who has access to the admin panel and their roles.</p>
                    <Link href="/admin/collections/admin-users" className="custom-card-action">
                        Manage Users &rarr;
                    </Link>
                </div>

                <div className="custom-card">
                    <h3>Legal Pages</h3>
                    <p>Edit terms, privacy policies, and other legal documents.</p>
                    <Link href="/admin/collections/legal-pages" className="custom-card-action">
                        Edit Content &rarr;
                    </Link>
                </div>

                <div className="custom-card">
                    <h3>Complaints / Feedback</h3>
                    <p>Review and resolve user-submitted complaints and feedback.</p>
                    <Link href="/admin/collections/complaints" className="custom-card-action">
                        View Submissions &rarr;
                    </Link>
                </div>

                <div className="custom-card">
                    <h3>Site Settings</h3>
                    <p>Configure global hero tickers and site-wide maintenance banners.</p>
                    <Link href="/admin/globals/site-settings" className="custom-card-action">
                        Global Settings &rarr;
                    </Link>
                </div>

                <div className="custom-card">
                    <h3>Fund Overrides</h3>
                    <p>Override database values for specific funds if needed.</p>
                    <Link href="/admin/collections/fund-overrides" className="custom-card-action">
                        Edit Overrides &rarr;
                    </Link>
                </div>
            </div>
        </div>
    )
}

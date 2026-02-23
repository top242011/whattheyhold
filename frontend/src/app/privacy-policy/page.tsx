import { Header } from "@/components/layout/Header";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
                        Privacy Policy
                    </h1>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                        <p className="mb-4">
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="mb-4">
                            At WhatTheyHold, we take your privacy seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or use our platform.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            1. Information We Collect
                        </h2>
                        <p className="mb-4">
                            When you visit the site, we automatically collect certain information about your device, including information about your web browser, IP address, timezone, and some of the cookies that are installed on your device.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            2. How We Use Your Information, Analytics & Data Monetization
                        </h2>
                        <p className="mb-4">
                            We use the information we collect to operate, maintain, and provide you with better features.
                            Through our cookie consent banner, you may opt-in to allow us to collect anonymous usage data (e.g., pages visited, funds searched, and interactions with our maps).
                        </p>
                        <p className="mb-4">
                            <strong>Commercial Use of Data:</strong> All analytics data is anonymized and aggregated. We do not collect or store personally identifiable information (PII) such as IP addresses or emails for analytics. We may use this aggregated, non-identifiable data to build market insights, predictive models, or research reports, which may be shared with or sold to third-party financial institutions, asset managers, or other commercial partners.
                        </p>
                        <p className="mb-4">
                            <strong>Affiliate & Referral Tracking:</strong> If you interact with external links or partner offers (such as opening an account with a broker), we may track these clicks anonymously to attribute referrals and earn affiliate commissions.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            3. Sharing Your Personal Information
                        </h2>
                        <p className="mb-4">
                            We <strong>do not sell, trade, or otherwise transfer your Personally Identifiable Information (PII)</strong> to outside parties. However, as stated above, we may share or monetize <strong>fully anonymized and aggregated behavioral data</strong> with our business partners. We may also share Personal Information only when required to comply with applicable laws and regulations.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            4. Changes to This Policy
                        </h2>
                        <p className="mb-4">
                            We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            5. Contact Us
                        </h2>
                        <p className="mb-4">
                            For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by email at privacy@whattheyhold.com.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

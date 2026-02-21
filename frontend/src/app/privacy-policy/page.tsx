import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
                            2. How We Use Your Information
                        </h2>
                        <p className="mb-4">
                            We use the information we collect to operate, maintain, and provide you with the features and functionality of the Service, to communicate with you, and to monitor and improve our Service.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            3. Sharing Your Personal Information
                        </h2>
                        <p className="mb-4">
                            We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. We may share your Personal Information to comply with applicable laws and regulations.
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
            <Footer />
        </div>
    );
}

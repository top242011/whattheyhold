import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <Header />
            <main className="flex-grow pt-32 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
                        Terms of Service
                    </h1>
                    <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                        <p className="mb-4">
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="mb-4">
                            Please read these Terms of Service completely using whattheyhold.com which is owned and operated by WhatTheyHold Inc. This Agreement documents the legally binding terms and conditions attached to the use of the Site at whattheyhold.com.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            1. Acceptance of Terms
                        </h2>
                        <p className="mb-4">
                            By using or accessing the Site in any way, viewing or browsing the Site, or adding your own content to the Site, you are agreeing to be bound by these Terms of Service.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            2. Intellectual Property
                        </h2>
                        <p className="mb-4">
                            The Site and all of its original content are the sole property of WhatTheyHold Inc. and are, as such, fully protected by the appropriate international copyright and other intellectual property rights laws.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            3. Disclaimer of Financial Advice
                        </h2>
                        <p className="mb-4">
                            The information provided by WhatTheyHold is for educational and informational purposes only and should not be construed as financial or investment advice. You should always consult with a qualified financial advisor before making any investment decisions.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            4. Termination
                        </h2>
                        <p className="mb-4">
                            WhatTheyHold reserves the right to terminate your access to the Site without any advance notice.
                        </p>

                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                            5. Contact Information
                        </h2>
                        <p className="mb-4">
                            If you have any questions about this Agreement, please feel free to contact us at terms@whattheyhold.com.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

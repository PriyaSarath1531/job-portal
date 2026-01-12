import React from 'react'
import { employerFeatures, jobSeekerFeatures } from '../../../utils/data'

const Features = () => {
    return (
        <section className="py-16 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold md:text-4xl text-gray-800">Everything You Need to <span className="block bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">Succeed</span></h2>
                    <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Powerful features designed to streamline your job search and hiring process.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 container mx-auto px-4 relative z-10">
                <div>
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-800">For Job Seekers</h3>
                        <div className="w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto h-1 rounded-full"></div>
                        <div className="space-y-8">
                            {jobSeekerFeatures.map((feature, index) => (
                                <div key={index} className="group flex items-start space-x-4 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                                    <feature.icon className="flex-shrink-0 w-8 h-8 text-blue-500" />
                                    <div>
                                    <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                                    <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-800">For Employers</h3>
                        <div className="w-24 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto h-1 rounded-full"></div>
                        <div className="space-y-8">
                            {employerFeatures.map((feature, index) => (
                                <div key={index} className="group flex items-start space-x-4 p-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                                    <feature.icon className="flex-shrink-0 w-8 h-8 text-blue-500" />
                                    <div>
                                    <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                                    <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
)
}
export default Features

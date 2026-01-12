import {Search,Users,FileText,MessageSquare,BarChart3,Shield,Clock,Award,Briefcase,Building2,LayoutDashboard,Plus,} from 'lucide-react';

export const jobSeekerFeatures =[
    {
        icon:Search,
        title:"Advanced Job Search",
        description:"Utilize our powerful search tools to find jobs that match your skills and preferences."
    },
    {
        icon:FileText,
        title:"Resume Builder",
        description:"Create a professional resume with our easy-to-use resume builder."
    },
    {
       icon:MessageSquare,
         title:"Direct Communication",
        description:"Keep track of your job applications and their statuses in one place."
    },
    {
        icon:Award,
        title:"Skill Assessments",
        description:"Showcase your skills with our integrated skill assessments and certifications."
    },
]
export const employerFeatures =[
    {
        icon:Users,
        title:"Talent Pool Access",
        description:"Access a vast database of qualified candidates to find the perfect fit for your job openings."
    },
    {
        icon:BarChart3,
        title:"Advanced Analytics",
        description:"Gain insights into your hiring processes with our comprehensive analytics tools."
    },
    {
        icon:Shield,
        title:"Secure Hiring",
        description:"Ensure a safe and secure hiring process with our verified candidate profiles."
    },
    {
        icon:Clock,
        title:"Efficient Job Posting",
        description:"Post job openings quickly and efficiently to attract top talent." 
    }
]
export const NAVIGATION_MENU=[
    {id:"employer-dashboard", name:"Dashboard",icon:LayoutDashboard},
    {id:"post-job", name:"Post Job",icon:Plus},
    {id:"manage-jobs", name:"Manage Jobs",icon:Briefcase},
    {id:"company-profile", name:"Company Profile",icon:Building2},
]
export const CATEGORIES=[
    {value:"Engineering", label:"Engineering"},
    {value:"Design", label:"Design"},
    {value:"Marketing", label:"Marketing"},
    {value:"Sales", label:"Sales"},
    {value:"Customer Service", label:"Customer Service"},
    {value:"IT & Software", label:"IT & Software"},
    {value:"Finance", label:"Finance"},
    {value:"HR", label:"Human Resources"},
    {value:"Product" ,label:"Product"},
    {value:"Operations", label:"Operations"},
    {value:"other", label:"Other"}
]
export const JOB_TYPES=[
    {value:"full-time", label:"Full Time"},
    {value:"part-time", label:"Part Time"},
    {value:"contract", label:"Contract"},
    {value:"internship", label:"Internship"},
    {value:"Remote", label:"Remote"}
]
export const SALARY_RANGES=[
    "less than $1000",
    "$1000 - $15000",
    "More than $15000"
]
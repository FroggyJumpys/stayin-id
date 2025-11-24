import Footer from "../components/Footer"
;
import { Link } from "react-router-dom";
import { useForm } from 'react-hook-form';

export default function Register() {
    const {
        register,
        handleSubmit,
    } = useForm();

    const onSubmit = (data) => console.log(data);
    
    return (
        <>
            <div className="bg-base-200 min-h-screen flex flex-col">
                <div className="flex-1 flex items-center justify-center min-h-screen">
                    <div className="card card-border bg-base-100 w-96 shadow-lg">
                        <div className="card-body">
                            <h2 className="card-title text-2xl">Register</h2>
                            <div className="divider"></div>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Username</span>
                                        </label>
                                        <label className="input validator join-item">
                                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <g
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                            strokeWidth="2.5"
                                            fill="none"
                                            stroke="currentColor"
                                            >
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                            </g>
                                        </svg>
                                        <input 
                                            type="text" 
                                            name="username" 
                                            {...register('username')}
                                            placeholder="johndoe" 
                                            required />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Email</span>
                                        </label>
                                        <label className="input validator join-item">
                                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <g
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                            strokeWidth="2.5"
                                            fill="none"
                                            stroke="currentColor"
                                            >
                                            <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                            </g>
                                        </svg>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            {...register('email')}
                                            placeholder="mail@site.com" 
                                            required />
                                        </label>
                                        <div className="validator-hint hidden">Enter valid email address</div>
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text font-semibold">Password</span>
                                        </label>
                                        <label className="input validator">
                                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <g
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                            strokeWidth="2.5"
                                            fill="none"
                                            stroke="currentColor"
                                            >
                                            <path
                                                d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                                            ></path>
                                            <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                                            </g>
                                        </svg>
                                        <input
                                            type="password"
                                            {...register('password')}
                                            required
                                            placeholder="Password"
                                            minLength="8"
                                            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                            title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                                        />
                                        </label>
                                        <p className="validator-hint hidden">
                                        Must be more than 8 characters, including
                                        <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-1">
                                    <span className="text-gray-500">Sudah memiliki akun? <Link to="/login" className="text-base-content underline hover:text-base-200">Login</Link></span>
                                </div>
                                <div className="card-actions justify-end mt-10">
                                    <button type="submit" className="btn btn-primary">Register</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <Footer /> 
            </div>
        </>
    )
}
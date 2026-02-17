import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LandingPage from '../pages/LandingPage'
import Documents from '../pages/Documents'
import { ROUTES } from './routes'

const Router = () => {
    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route
                    path={ROUTES.HOME}
                    element={
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full flex flex-col items-center"
                        >
                            <LandingPage />
                        </motion.div>
                    }
                />

                <Route
                    path={ROUTES.DOCS}
                    element={<Documents />}
                />
            </Routes>
        </AnimatePresence>
    )
}

export default Router

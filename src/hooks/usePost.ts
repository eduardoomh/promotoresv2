import { GlobalContext } from '@/context/globalContext'
import { getToken } from '@/libs/token'
import { notification } from 'antd'
import axios, { AxiosRequestConfig } from 'axios'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
interface AuthFetchProps {
    endpoint: string
    redirectRoute?: string
    formData: any
    reloadPage: boolean,
    cleanForm: any,
    options?: AxiosRequestConfig<any>
}

export function usePost() {
    const { startLoading, endLoading } = useContext(GlobalContext)
    const router = useRouter()
    
    const fetchPost = async ({
        endpoint,
        formData,
        redirectRoute,
        reloadPage,
        cleanForm
    }: AuthFetchProps) => {
        try {
            startLoading()
            const response = await axios.post(
                `/api/${endpoint}`,
                formData,
            )

            if (response.status !== 200) {
                endLoading()
                notification.error({
                    message: response.data.message
                })
                return
            } else {
                notification.success({
                    message: response.data.message
                })
                endLoading()
                if (cleanForm) cleanForm()
                if (reloadPage) router.refresh()
                if (redirectRoute) router.push(redirectRoute)

            }

        } catch (error: any) {
            console.log(error)
            endLoading()
            notification.error({
                message: error.response.data.message
            })

        }
    }

    return fetchPost
}
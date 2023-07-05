import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const activeHttpRequests = useRef([]);

    const sendRequest = useCallback(async (
        url,
        method = 'GET',
        body = null,
        headers = {}
    ) => {
        setIsLoading(true);

        const httpAbortCtrl = new AbortController();
        activeHttpRequests.current.push(httpAbortCtrl);

        try {
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal
            });

            const responseData = await response.json();
            activeHttpRequests.current = activeHttpRequests.current.filter(
                abortCtrl => abortCtrl !== httpAbortCtrl
            );

            if (!response.ok) {
                console.log('Error thrown');
                throw new Error(responseData.message);
            }
            console.log('returned');

            setIsLoading(false);
            return responseData;
        } catch (error) {
            setIsLoading(false);
            setError(error.message);
            throw null;
            throw error;
        }
    }, []);

    const onCloseError = () => {
        setError(null);
    };

    useEffect(() => {
        return () => {
           activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
        };
    }, []);

    return { isLoading, error, sendRequest, onCloseError };
};

export default useHttpClient;

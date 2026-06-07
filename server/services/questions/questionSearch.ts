export function getQuestionSearchWhere(search?: string) {
    const query = search?.trim();

    if (!query) {
        return undefined;
    }

    return {
        OR: [
            {
                title: {
                    contains: query,
                },
            },
            {
                description: {
                    contains: query,
                },
            },
            {
                user: {
                    name: {
                        contains: query,
                    },
                },
            },
            {
                user: {
                    is: {
                        email: {
                            contains: query,
                        },
                    },
                },
            },
            {
                comments: {
                    some: {
                        text: {
                            contains: query,
                        },
                    },
                },
            },
        ],
    };
}

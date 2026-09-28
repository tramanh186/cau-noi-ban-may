import OpenAI from "openai";


const openai =
    new OpenAI({

        apiKey:
            process.env.OPENAI_API_KEY

    });



export default async function handler(
    req,
    res
) {


    /* ==================================
       ONLY POST
    ================================== */

    if (
        req.method !==
        "POST"
    ) {

        return res
            .status(405)
            .json({

                error:
                    "Method not allowed"

            });

    }



    try {


        const text =
            req.body?.text;


        if (
            !text ||
            typeof text !== "string"
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Không có nội dung để dịch."

                });

        }



        /*
        Giới hạn MVP
        */

        if (
            text.length >
            40000
        ) {

            return res
                .status(400)
                .json({

                    error:
                        "Tài liệu quá dài. Hãy thử nội dung ngắn hơn 40.000 ký tự."

                });

        }



        const response =
            await openai
                .responses
                .create({


                    /*
                    Có thể đổi model sau.
                    */

                    model:
                        "gpt-5.6-luna",



                    instructions: `

You are the translation engine for
"Cầu Nối Bản Mây",
a multilingual educational community project.

The user may submit text in:

1. Vietnamese
2. English
3. Hmong

Your job is to create THREE parallel versions:

- Vietnamese
- English
- Hmong

Detect the source language automatically.

IMPORTANT RULES:

1. Preserve the meaning of the source.

2. Do not summarize.

3. Do not add facts.

4. Preserve headings,
paragraph structure,
numbers and proper names.

5. If the original text is already
in one of the three languages,
preserve its meaning faithfully
in that corresponding output.

6. For Hmong,
use Latin-script Hmong.

7. If you are uncertain about a
specific Hmong term,
use the most likely translation
but append [NEEDS REVIEW].

8. The Hmong output is an AI draft
that may later be reviewed
by native Hmong speakers.

Return ONLY the three requested
language versions according to
the output schema.

                    `,


                    input:
                        text,



                    text: {

                        format: {

                            type:
                                "json_schema",


                            name:
                                "three_language_translation",


                            strict:
                                true,


                            schema: {

                                type:
                                    "object",


                                properties: {


                                    vietnamese: {

                                        type:
                                            "string"

                                    },


                                    english: {

                                        type:
                                            "string"

                                    },


                                    hmong: {

                                        type:
                                            "string"

                                    }

                                },


                                required: [

                                    "vietnamese",

                                    "english",

                                    "hmong"

                                ],


                                additionalProperties:
                                    false

                            }

                        }

                    },



                    store:
                        false

                });



        const result =
            JSON.parse(
                response.output_text
            );



        return res
            .status(200)
            .json({

                vietnamese:
                    result.vietnamese,

                english:
                    result.english,

                hmong:
                    result.hmong

            });


    }


    catch (error) {


        console.error(error);


        return res
            .status(500)
            .json({

                error:
                    "Hệ thống chưa thể dịch tài liệu."

            });

    }

}
#This is a very simple demo of sentiment analysis.

from alchemyapi import AlchemyAPI
alchemyapi = AlchemyAPI()


# """
# This function takes a text and returns an object of this form: {"text", "score", "type"}.
# "score" is a number between -1 and 1 which indicates the extent to which the input text is positive (or negative).
# "type" can be either "positive", "negative" or "neutral"
# """
def sentiment (text):
        response = alchemyapi.sentiment(text)
        senti = response["docSentiment"]
        res = {"text" : text, "score" : senti["score"],  "type" : senti["type"]}
        return res



# """
# This function takes a text and returns all the keywords in the text.
# The output contains the text itself and a list of keyword information.
# The information contains a string of keyword and a number from 0 to 1 which indecates the relevance of this keyword is.
# """
def keyWords (text):
        keywordsInfo = []
        response = alchemyapi.keywords('text', text, {'sentiment': 1})
        keywords = response["keywords"]
        for keyword in keywords:
                keywordInfo = {"keyword" : keyword["text"], "relevance" : keyword["relevance"]}
                keywordsInfo = keywordsInfo + [keywordInfo]
        res = {"text" : text, "info" : keywordsInfo}
        return res





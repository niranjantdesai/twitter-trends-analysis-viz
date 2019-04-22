import pickle


def predict_life(classification_model: str, regression_model: str):
    """
    Predict the life of a Twitter trend from Google Trends interest over time data and Wikipedia pageview data
    :param classification_model:
    :param regression_model:
    :return:
    """

    classification_file = open(classification_model, 'rb')
    classifier = pickle.load(classification_file)
    classification_file.close()

    regression_file = open(regression_model, 'rb')
    lr = pickle.load(regression_file)
    regression_file.close()

    pass


if __name__ == '__main__':
    predict_life('../data/Classification_Model', '../data/Regression_Model')

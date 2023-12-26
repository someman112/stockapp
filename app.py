# from flask import Flask, render_template, jsonify
# import csv
#
# app = Flask(__name__)
#
# data = []
#
#
# @app.route('/')
# def index():
#     return render_template('index.html', chart_data=read_csv_data())
#
#
# @app.route('/get_data')
# def get_data():
#     data_array = read_csv_data()
#     return jsonify(data_array)
#
#
# def read_csv_data():
#     with open('price_data.csv', 'r') as csv_file:
#         reader = csv.DictReader(csv_file)
#         for row in reader:
#             data.append(row)
#         print(data)
#     return data
#
#
# if __name__ == '__main__':
#     app.run(debug=True)

from flask import Flask, render_template, jsonify, request
import csv

app = Flask(__name__)

data = []


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/trade')
def trade():
    search_query = request.args.get('search_query', '')
    # Process the search query and generate the response for the trade page
    return render_template('chart/chart.html', search_query=search_query)


if __name__ == '__main__':
    app.run(debug=True)
